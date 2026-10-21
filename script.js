// ROYAL EVENTS - GALLERY PHOTOS
const galleryData = {
  wedding: [
    ["Royal Floral Mandap", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85"],
    ["Wedding Ceremony", "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85"],
    ["Wedding Tablescape", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85"]
  ],
  birthday: [
    ["Birthday Celebration", "https://images.unsplash.com/photo-1530103862676-de8c9de5b6ad?auto=format&fit=crop&w=900&q=85"],
    ["Party Decoration", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85"]
  ],
  "baby-shower": [
    ["Baby Shower Decor", "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=85"],
    ["Celebration Details", "https://images.unsplash.com/photo-1530103862676-de8c9de5b6ad?auto=format&fit=crop&w=900&q=85"]
  ],
  engagement: [
    ["Engagement Celebration", "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85"],
    ["Floral Stage", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85"]
  ],
  anniversary: [
    ["Anniversary Dinner", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85"],
    ["Elegant Celebration", "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85"]
  ],
  "car-decoration": [
    ["Wedding Floral Decor", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85"]
  ],
  catering: [
    ["Elegant Dining", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85"],
    ["Beautiful Table Setting", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85"]
  ],
  other: [
    ["Celebration Styling", "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=85"],
    ["Special Event", "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85"]
  ]
};

// GALLERY: PHOTOS APPEAR ONLY AFTER CATEGORY CLICK
const galleryGrid = document.getElementById("gallery-grid");
const galleryMessage = document.getElementById("gallery-message");
const categoryButtons = document.querySelectorAll(".category-button");

function showGallery(category) {
  const photos = galleryData[category] || [];

  categoryButtons.forEach(button => {
    const active = button.dataset.category === category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  galleryGrid.innerHTML = "";
  galleryMessage.hidden = true;
  galleryGrid.hidden = false;

  photos.forEach(([caption, src]) => {
    const card = document.createElement("article");
    card.className = "gallery-card";

    const img = document.createElement("img");
    img.src = src;
    img.alt = caption;
    img.loading = "lazy";

    const title = document.createElement("p");
    title.textContent = caption;

    card.append(img, title);
    galleryGrid.appendChild(card);
  });
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    showGallery(button.dataset.category);
  });

  button.setAttribute("aria-pressed", "false");
});

// CLIENT REVIEWS
// These are sample testimonials for the design preview.
const reviewData = [
  {
    stars: 5,
    title: "A Beautiful Wedding Setup",
    text: "The mandap looked beautiful and elegant. The floral decoration and colour combinations created a lovely atmosphere. The planning was thoughtful and the overall design felt suitable for our family celebration. Every detail added to the occasion. We especially liked the graceful stage arrangement and the way the decor looked in photographs. It was a memorable wedding setting.",
    name: "Wedding Client",
    event: "Wedding & Mandap"
  },
  {
    stars: 5,
    title: "A Birthday Full of Joy",
    text: "We wanted a cheerful birthday theme that looked colourful and classy. The backdrop made a lovely place for family photographs. The decoration matched the theme we had discussed and the arrangement felt welcoming. The details helped make the celebration feel extra special. We appreciated the creative ideas and the overall presentation of the party space.",
    name: "Birthday Client",
    event: "Birthday Decoration"
  },
  {
    stars: 5,
    title: "A Lovely Engagement",
    text: "The engagement decoration had a warm and romantic feel. We liked the floral colours and the elegant stage layout. The design looked graceful without feeling overcrowded. The team considered the style we wanted and helped create a setting that suited the occasion. Our family enjoyed the atmosphere and the celebration photographs turned out beautifully.",
    name: "Engagement Client",
    event: "Engagement"
  },
  {
    stars: 4,
    title: "Beautiful Baby Shower Details",
    text: "We wanted a soft and charming theme for our baby shower. The colours and backdrop gave the celebration a warm atmosphere. The decorative details felt coordinated and attractive. We appreciated having our preferences considered during the planning. The final arrangement created a lovely space for family members to gather, celebrate and take photographs together.",
    name: "Baby Shower Client",
    event: "Baby Shower"
  },
  {
    stars: 5,
    title: "A Special Anniversary",
    text: "The styling gave our anniversary gathering a special atmosphere. The table decoration and surrounding details worked well together. We wanted something elegant rather than overly formal, and the overall design suited that mood. The setting was welcoming for our guests and created a lovely backdrop for photographs. It made our family celebration feel thoughtfully arranged and memorable.",
    name: "Anniversary Client",
    event: "Anniversary"
  },
  {
    stars: 5,
    title: "Thoughtful Event Styling",
    text: "We wanted a coordinated dining arrangement for a family function. The presentation looked neat, polished and welcoming. The overall styling helped bring the space together without making it feel too crowded. We liked the attention given to the small details and the way the decoration complemented the occasion. The setting felt appropriate for a relaxed and happy gathering.",
    name: "Family Event Client",
    event: "Catering & Styling"
  }
];

const reviewsGrid = document.getElementById("reviews-grid");

reviewData.forEach(review => {
  const card = document.createElement("article");
  card.className = "review-card";

  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${review.stars} out of 5 stars`);
  stars.textContent =
    "★".repeat(review.stars) +
    "☆".repeat(5 - review.stars);

  const heading = document.createElement("h3");
  heading.textContent = review.title;

  const text = document.createElement("p");
  text.textContent = review.text;

  const author = document.createElement("div");
  author.className = "review-author";

  const name = document.createElement("strong");
  name.textContent = review.name;

  const event = document.createElement("span");
  event.textContent = review.event;

  author.append(name, event);
  card.append(stars, heading, text, author);
  reviewsGrid.appendChild(card);
});

// MOBILE NAVIGATION
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// CURRENT YEAR
document.getElementById("year").textContent =
  new Date().getFullYear();

// ENQUIRY FORM
// This demo prepares a message; it does not send it automatically.
document.getElementById("enquiry-form").addEventListener("submit", event => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);

  const message = [
    "Hello Royal Events!",
    `Name: ${form.get("name")}`,
    `Phone: ${form.get("phone")}`,
    `Event: ${form.get("event")}`,
    `Details: ${form.get("details") || "Not provided"}`
  ].join("\n");

  const note = document.getElementById("form-note");
  note.textContent =
    "Your enquiry message is ready. Copy it and send it to Royal Events.";

  let preview = document.getElementById("prepared-message");

  if (!preview) {
    preview = document.createElement("textarea");
    preview.id = "prepared-message";
    preview.readOnly = true;
    preview.setAttribute("aria-label", "Prepared enquiry message");
    preview.style.cssText =
      "margin-top:10px;width:100%;min-height:115px;padding:10px;";
    note.insertAdjacentElement("afterend", preview);
  }

  preview.value = message;
});