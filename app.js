
document.addEventListener("DOMContentLoaded", () => {
  const config = window.ROYAL_CONFIG || {};
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const opened = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(opened));
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => mainNav.classList.remove("open"));
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const socialLinks = {
    instagramLink: config.instagramUrl,
    facebookLink: config.facebookUrl,
    
whatsappLink: config.whatsappNumber
  ? `https://wa.me/${String(config.whatsappNumber).replace(/\D/g, "")}`
  : ""

  };

  Object.entries(socialLinks).forEach(([id, url]) => {
    const link = document.getElementById(id);
    if (!link) return;

    if (url) {
      link.href = url;
    } else {
      link.hidden = true;
    }
  });

  // Supabase connection is optional for the rest of the website.
  let supabaseClient = null;

  const hasSupabaseConfig =
    config.supabaseUrl &&
    config.supabaseKey &&
    config.supabaseUrl.startsWith("https://") &&
    !config.supabaseUrl.includes("PASTE_YOUR");

  if (hasSupabaseConfig && window.supabase) {
    supabaseClient = window.supabase.createClient(
      config.supabaseUrl,
      config.supabaseKey
    );
  }

  const categoryGrid = document.getElementById("categoryGrid");
  const galleryResults = document.getElementById("galleryResults");
  const selectedCategory = document.getElementById("selectedCategory");
  const galleryMessage = document.getElementById("galleryMessage");
  const photoGrid = document.getElementById("photoGrid");
  const closeGallery = document.getElementById("closeGallery");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt) {
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Event photograph";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = "";
    document.body.style.overflow = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  function showGalleryMessage(message) {
    galleryMessage.textContent = message;
    galleryMessage.hidden = false;
  }

  function createPhotoCard(photo) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-photo";
    button.setAttribute("aria-label", `View ${photo.title || "event photo"}`);

    const img = document.createElement("img");
    img.src = photo.image_url;
    img.alt = photo.title || `${photo.category} decoration`;
    img.loading = "lazy";

    img.addEventListener("error", () => {
      button.remove();
      if (!photoGrid.children.length) {
        showGalleryMessage("Some photographs could not be loaded.");
      }
    });

    button.appendChild(img);
    button.addEventListener("click", () => {
      openLightbox(photo.image_url, img.alt);
    });

    return button;
  }

  async function openCategory(category) {
    selectedCategory.textContent = category;
    galleryResults.hidden = false;
    categoryGrid.hidden = true;
    photoGrid.replaceChildren();
    showGalleryMessage("Loading photographs...");
    galleryResults.scrollIntoView({ behavior: "smooth", block: "start" });

    if (!supabaseClient) {
      showGalleryMessage(
        "Gallery abhi connect nahi hai. config.js mein apni Supabase URL aur publishable/anon key set karo."
      );
      return;
    }

    try {
      const table = config.galleryTable || "gallery_images";

      const { data, error } = await supabaseClient
        .from(table)
        .select("id, title, category, image_url, created_at")
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        showGalleryMessage(
          `Is ${category} category mein abhi koi photo nahi hai. Admin panel se photos add karo.`
        );
        return;
      }

      data.forEach(photo => {
        if (photo.image_url) photoGrid.appendChild(createPhotoCard(photo));
      });

      galleryMessage.hidden = photoGrid.children.length > 0;

      if (!photoGrid.children.length) {
        showGalleryMessage("Is category mein dikhane ke liye photos nahi hain.");
      }
    } catch (error) {
      console.error("Gallery loading error:", error);
      showGalleryMessage(
        "Gallery load nahi hui. Supabase table, column names aur permissions check karo."
      );
    }
  }

  categoryGrid.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      openCategory(button.dataset.category);
    });
  });

  closeGallery.addEventListener("click", () => {
    galleryResults.hidden = true;
    categoryGrid.hidden = false;
    categoryGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Contact form opens a prefilled WhatsApp message.
  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactStatus");

  contactForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!config.whatsappNumber ||
        config.whatsappNumber.includes("X")) {
      contactStatus.textContent =
        "Pehle config.js mein apna WhatsApp number set karo.";
      return;
    }

    const form = new FormData(contactForm);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const eventType = String(form.get("event") || "").trim();
    const message = String(form.get("message") || "").trim();

    const text = [
      "Hello Royal Events!",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Occasion: ${eventType}`,
      `Details: ${message || "Not provided"}`
    ].join("\n");

    const url =
      `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    contactStatus.textContent =
      "WhatsApp khul gaya hai. Enquiry bhejne ke liye Send dabao.";
  });
});
