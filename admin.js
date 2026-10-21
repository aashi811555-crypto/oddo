
document.addEventListener("DOMContentLoaded", () => {
  const config = window.ROYAL_CONFIG || {};

  const loginPanel = document.getElementById("loginPanel");
  const dashboardPanel = document.getElementById("dashboardPanel");
  const loginForm = document.getElementById("loginForm");
  const photoForm = document.getElementById("photoForm");

  const loginStatus = document.getElementById("loginStatus");
  const adminStatus = document.getElementById("adminStatus");
  const adminGallery = document.getElementById("adminGallery");

  const logoutButton = document.getElementById("logoutButton");
  const refreshButton = document.getElementById("refreshButton");
  const uploadButton = document.getElementById("uploadButton");

  const photoFiles = document.getElementById("photoFiles");
  const photoFolder = document.getElementById("photoFolder");
  const photoCategory = document.getElementById("photoCategory");
  const selectedPhotos = document.getElementById("selectedPhotos");

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  const bucket = config.storageBucket || "royal-events-gallery";
  const table = config.galleryTable || "gallery_images";

  const configured =
    config.supabaseUrl &&
    config.supabaseKey &&
    config.supabaseUrl.startsWith("https://") &&
    !config.supabaseUrl.includes("YOUR_EXISTING") &&
    !config.supabaseUrl.includes("PASTE_YOUR") &&
    !config.supabaseKey.includes("YOUR_EXISTING") &&
    !config.supabaseKey.includes("PASTE_YOUR");

  if (!configured || !window.supabase) {
    loginStatus.textContent =
      "Supabase setup missing. Check your config.js URL and publishable/anon key.";
    loginForm.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  const client = window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseKey
  );

  let uploading = false;

  function setLoggedIn(isLoggedIn) {
    loginPanel.hidden = isLoggedIn;
    dashboardPanel.hidden = !isLoggedIn;
    logoutButton.hidden = !isLoggedIn;
  }

  function cleanFolderName(value) {
    return value
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "");
  }

  function makeSafeFileName(fileName) {
    const lastDot = fileName.lastIndexOf(".");
    const extension = lastDot >= 0
      ? fileName.slice(lastDot).toLowerCase()
      : "";

    const baseName = lastDot >= 0
      ? fileName.slice(0, lastDot)
      : fileName;

    const safeBase = baseName
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    return (safeBase || "photo") + extension;
  }

  function titleFromFileName(fileName) {
    const lastDot = fileName.lastIndexOf(".");
    const name = lastDot > 0
      ? fileName.slice(0, lastDot)
      : fileName;

    return name
      .replace(/[_-]+/g, " ")
      .trim() || "Royal Events Photo";
  }

  function setBusy(isBusy) {
    uploading = isBusy;
    uploadButton.disabled = isBusy;
    photoFiles.disabled = isBusy;
    photoFolder.disabled = isBusy;
    photoCategory.disabled = isBusy;

    uploadButton.textContent = isBusy
      ? "Uploading Photos..."
      : "Upload All Photos";
  }

  function showSelectedFiles() {
    selectedPhotos.replaceChildren();

    const files = Array.from(photoFiles.files || []);

    if (files.length === 0) {
      selectedPhotos.textContent = "No photos selected.";
      return;
    }

    const heading = document.createElement("strong");
    heading.textContent = `${files.length} photo(s) selected`;
    selectedPhotos.appendChild(heading);

    const list = document.createElement("ul");

    files.forEach(file => {
      const item = document.createElement("li");
      item.textContent =
        `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      list.appendChild(item);
    });

    selectedPhotos.appendChild(list);
  }

  photoFiles.addEventListener("change", showSelectedFiles);

  async function refreshSession() {
    const { data, error } = await client.auth.getSession();

    if (error) {
      loginStatus.textContent = error.message;
      return;
    }

    const session = data.session;
    setLoggedIn(Boolean(session));

    if (session) {
      await loadPhotos();
    }
  }

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    loginStatus.textContent = "Signing in...";

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;

    const { error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      loginStatus.textContent = "Login failed: " + error.message;
      return;
    }

    loginStatus.textContent = "";
    setLoggedIn(true);
    await loadPhotos();
  });

  logoutButton.addEventListener("click", async () => {
    const { error } = await client.auth.signOut();

    if (error) {
      adminStatus.textContent = "Logout error: " + error.message;
      return;
    }

    setLoggedIn(false);
    adminGallery.replaceChildren();
    loginStatus.textContent = "You have logged out.";
  });

  async function loadPhotos() {
    adminStatus.textContent = "Loading gallery...";
    adminGallery.replaceChildren();

    const { data, error } = await client
      .from(table)
      .select("id, title, category, image_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      adminStatus.textContent =
        "Could not load gallery. Check table, permissions and login.";
      console.error("Gallery load error:", error);
      return;
    }

    if (!data || data.length === 0) {
      adminStatus.textContent = "No photographs have been added yet.";
      return;
    }

    adminStatus.textContent = `${data.length} photograph(s) found.`;

    data.forEach(photo => {
      const row = document.createElement("article");
      row.className = "admin-photo";

      const img = document.createElement("img");
      img.src = photo.image_url;
      img.alt = photo.title || "Royal Events gallery photo";
      img.loading = "lazy";

      const info = document.createElement("div");

      const title = document.createElement("strong");
      title.textContent = photo.title || "Untitled photo";

      const category = document.createElement("small");
      category.textContent = photo.category || "Uncategorised";

      info.append(title, category);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "delete-photo";
      removeButton.textContent = "Delete";

      removeButton.addEventListener("click", async () => {
        const confirmed = window.confirm(
          `Delete "${photo.title || "this photo"}" from the gallery?`
        );

        if (!confirmed) return;

        removeButton.disabled = true;

        const { error: deleteError } = await client
          .from(table)
          .delete()
          .eq("id", photo.id);

        if (deleteError) {
          adminStatus.textContent =
            "Delete failed: " + deleteError.message;
          removeButton.disabled = false;
          console.error(deleteError);
          return;
        }

        await loadPhotos();
      });

      row.append(img, info, removeButton);
      adminGallery.appendChild(row);
    });
  }

  photoForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (uploading) return;

    const files = Array.from(photoFiles.files || []);
    const folder = cleanFolderName(photoFolder.value);
    const category = photoCategory.value;

    if (files.length === 0) {
      adminStatus.textContent = "Please choose at least one photo.";
      return;
    }

    if (!folder) {
      adminStatus.textContent =
        "Enter a valid folder name, for example wedding.";
      return;
    }

    const invalidFile = files.find(file =>
      !allowedTypes.includes(file.type) || file.size === 0
    );

    if (invalidFile) {
      adminStatus.textContent =
        `Unsupported or empty file: ${invalidFile.name}. Use JPG, PNG, WEBP or GIF.`;
      return;
    }

    // Avoid accidental uploads that exceed the usual 50 MB
    // per-file limit on a default Supabase Storage bucket.
    const tooLarge = files.find(file => file.size > 50 * 1024 * 1024);

    if (tooLarge) {
      adminStatus.textContent =
        `${tooLarge.name} is larger than 50 MB. Choose a smaller image or adjust the bucket's upload limit.`;
      return;
    }

    setBusy(true);

    let successCount = 0;
    const failures = [];

    try {
      for (const file of files) {
        adminStatus.textContent =
          `Uploading ${successCount + 1} of ${files.length}: ${file.name}`;

        const safeName = makeSafeFileName(file.name);
        const uniqueName =
          `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

        const objectPath = `${folder}/${uniqueName}`;

        // Upload image to Supabase Storage.
        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(objectPath, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) {
          failures.push(`${file.name}: ${uploadError.message}`);
          console.error("Storage upload error:", uploadError);
          continue;
        }

        // Obtain the public URL for the public bucket.
        const { data: urlData } = client.storage
          .from(bucket)
          .getPublicUrl(objectPath);

        const imageUrl = urlData && urlData.publicUrl;

        if (!imageUrl) {
          failures.push(`${file.name}: Could not obtain image URL.`);
          continue;
        }

        // Save metadata in the existing gallery table.
        const { error: insertError } = await client
          .from(table)
          .insert([{
            title: titleFromFileName(file.name),
            category,
            image_url: imageUrl
          }]);

        if (insertError) {
          failures.push(
            `${file.name}: File uploaded, but database save failed: ${insertError.message}`
          );
          console.error("Gallery insert error:", insertError);
          continue;
        }

        successCount++;
      }

      if (failures.length === 0) {
        photoForm.reset();
        photoFolder.value = folder;
        photoCategory.value = category;
        showSelectedFiles();

        adminStatus.textContent =
          `Success! ${successCount} photo(s) uploaded and saved to the gallery.`;
      } else {
        adminStatus.textContent =
          `${successCount} photo(s) saved. ${failures.length} item(s) failed. Details: ${failures.join(" | ")}`;
      }

      await loadPhotos();

    } catch (error) {
      console.error("Upload error:", error);
      adminStatus.textContent =
        "Upload error: " + (error.message || "Please check your connection and Supabase settings.");
    } finally {
      setBusy(false);
    }
  });

  refreshButton.addEventListener("click", loadPhotos);

  client.auth.onAuthStateChange((_event, session) => {
    setLoggedIn(Boolean(session));
  });

  refreshSession();
});
