/**
 * FlyingScissor - Data Layer
 * Hair salon · Hair stylist · Beauty, cosmetic & personal care
 * The Best Hair Cutting Saloon in Faisalabad
 */

export const BARBERSHOP_DATA = {
  brand: {
    name: "FlyingScissor",
    tagline: "Hair salon · Hair stylist · Beauty, cosmetic & personal care",
    slogan: "The Best Hair Cutting Saloon in Faisalabad",
    established: "2015",
    rating: 4.99,
    reviewsCount: 2850,
    phone: "+92 300 7654321",
    email: "contact@flyingscissor.com",
    instagram: "@flying_scissorofficial",
    instagramUrl: "https://www.instagram.com/flying_scissorofficial/",
    address: "Main Boulevard, D-Ground / Kohinoor City, Faisalabad",
    hours: {
      weekday: "10:00 AM – 11:00 PM",
      saturday: "10:00 AM – 11:30 PM",
      sunday: "11:00 AM – 10:00 PM"
    }
  },

  services: [
    {
      id: "srv-exec-cut",
      category: "haircraft",
      title: "FlyingScissor Signature Cut",
      duration: "45 mins",
      durationMins: 45,
      price: 2500,
      priceFormatted: "Rs. 2,500",
      popular: true,
      description: "Custom styling consultation, signature flying scissor technique, precision clipper fade, energizing hair wash massage, and premium matte finish styling.",
      badge: "Most Popular",
      icon: "scissors"
    },
    {
      id: "srv-royal-shave",
      category: "shave",
      title: "Royal Straight Razor Shave",
      duration: "40 mins",
      durationMins: 40,
      price: 1800,
      priceFormatted: "Rs. 1,800",
      popular: false,
      description: "Pre-shave essential oils, 3-stage steamed eucalyptus towels, warm rich lather shave with Japanese steel, and ice-cold rosewater toner.",
      badge: "Signature Ritual",
      icon: "razor"
    },
    {
      id: "srv-beard-sculpt",
      category: "shave",
      title: "Master Beard Sculpt & Sharp Lineup",
      duration: "35 mins",
      durationMins: 35,
      price: 1500,
      priceFormatted: "Rs. 1,500",
      popular: true,
      description: "Beard architecture tailored to your jaw structure, razor-sharp cheek & neck definition, conditioning steam treatment, and nourishing beard elixir.",
      badge: "Trending in Faisalabad",
      icon: "beard"
    },
    {
      id: "srv-crown-ritual",
      category: "vip",
      title: "FlyingScissor VIP Grooming Package",
      duration: "90 mins",
      durationMins: 90,
      price: 5500,
      priceFormatted: "Rs. 5,500",
      popular: true,
      description: "The complete grooming ritual: Signature haircut, royal hot towel beard sculpt, deep clarifying herbal facial, scalp massage, and fresh espresso service.",
      badge: "All-Inclusive VIP",
      icon: "crown"
    },
    {
      id: "srv-charcoal-facial",
      category: "rituals",
      title: "Volcanic Charcoal Detox Facial",
      duration: "40 mins",
      durationMins: 40,
      price: 2200,
      priceFormatted: "Rs. 2,200",
      popular: false,
      description: "Deep pore cleansing steam, activated bamboo charcoal mask, chilled jade roller circulation massage, and intense hydration booster.",
      badge: "Skin Rejuvenation",
      icon: "sparkles"
    },
    {
      id: "srv-scalp-therapy",
      category: "rituals",
      title: "Keratin & Protein Hair Treatment",
      duration: "45 mins",
      durationMins: 45,
      price: 3500,
      priceFormatted: "Rs. 3,500",
      popular: false,
      description: "Intense hair smoothing & protein therapy to eliminate frizz, repair damaged cuticles, and restore natural shine and strength.",
      badge: "Hair Health",
      icon: "feather"
    }
  ],

  barbers: [
    {
      id: "barber-shahzad",
      name: "Shahzad",
      title: "Founder & Master Hair Stylist",
      experience: "15+ Years",
      rating: 5.0,
      cutsDone: "20,000+",
      specialty: "High Skin Fades, Scissor Work & Celebrity Styling",
      bio: "Renowned hair artist behind @flying_scissorofficial. Pioneer of precision scissor techniques and modern grooming trends in Faisalabad.",
      image: "assets/images/master-barber-shave.jpg",
      quote: "Style is your signature. We craft perfection with every cut.",
      tags: ["Flying Scissors", "Celebrity Cuts", "VIP Chair"]
    },
    {
      id: "barber-ali",
      name: "Ali Raza",
      title: "Lead Beard Architect & Shave Artisan",
      experience: "10 Years",
      rating: 4.98,
      cutsDone: "12,800+",
      specialty: "Beard Sculpture & Japanese Straight Razor",
      bio: "Renowned for symmetrical beard sculpting that complements facial anatomy. Master of warm towel rituals and razor precision.",
      image: "assets/images/style-pompadour.jpg",
      quote: "Sharp lines define confidence.",
      tags: ["Beard Sculpt", "Straight Razor", "Hot Towel"]
    },
    {
      id: "barber-usman",
      name: "Usman Malik",
      title: "Creative Stylist & Texture Specialist",
      experience: "8 Years",
      rating: 4.97,
      cutsDone: "8,500+",
      specialty: "Textured Crops, Modern Tapers & Volume Styling",
      bio: "Specialist in modern textured motion, low drop fades, burst fades, and contemporary youth styling.",
      image: "assets/images/style-crop.jpg",
      quote: "Precision is not an act, it is a discipline.",
      tags: ["Textured Crops", "Drop Fade", "Korean & Taper Cuts"]
    }
  ],

  styles: [
    {
      id: "style-fade-beard",
      title: "High Skin Fade & Sculpted Beard",
      category: "FlyingScissor Signature",
      cutTime: "50 mins",
      maintenance: "Medium (Every 2-3 wks)",
      bestFor: "Square, Oval, & Round face shapes",
      stylingProduct: "Matte Styling Clay + Argan Beard Elixir",
      description: "Seamless skin taper on the temples and neckline, textured volume on crown, paired with a razor-crisp geometric beard lineup.",
      imageBefore: "assets/images/before-cut.jpg",
      imageAfter: "assets/images/after-cut.jpg",
      tags: ["Skin Fade", "Beard Lineup", "Modern Classic"]
    },
    {
      id: "style-pompadour",
      title: "Executive Royal Pompadour",
      category: "Executive Classic",
      cutTime: "45 mins",
      maintenance: "Low-Medium (Every 3 wks)",
      bestFor: "Oval, Oblong, & Diamond face shapes",
      stylingProduct: "High-Hold Classic Pomade + Grooming Spray",
      description: "Polished gentleman volume brushed gracefully back with subtle tapered sides for a commanding presence in boardroom and weddings.",
      image: "assets/images/style-pompadour.jpg",
      tags: ["Classic Pompadour", "Taper", "Executive"]
    },
    {
      id: "style-crop",
      title: "Textured French Crop & Drop Fade",
      category: "Modern Editorial",
      cutTime: "40 mins",
      maintenance: "High (Every 2 wks)",
      bestFor: "Oval, Heart, & Angular face shapes",
      stylingProduct: "Matte Texture Powder + Feather Paste",
      description: "Blunt or point-cut forward fringe paired with a seamless drop fade around the ears, delivering effortless, dynamic daily texture.",
      image: "assets/images/style-crop.jpg",
      tags: ["French Crop", "Drop Fade", "Streetwear Look"]
    }
  ],

  products: [
    {
      id: "prod-matte-clay",
      name: "FlyingScissor Matte Styling Clay",
      subtitle: "Strong Hold • Natural Matte Finish • Sandalwood Scent",
      price: 1800,
      priceFormatted: "Rs. 1,800",
      size: "100g / 3.5 oz",
      rating: 4.9,
      badge: "Bestseller",
      desc: "Bentonite clay and organic beeswax blend providing all-day pliable hold without grease, residue, or stiffness.",
      image: "assets/images/grooming-products.jpg"
    },
    {
      id: "prod-beard-elixir",
      name: "Luxury Argan Beard Elixir",
      subtitle: "Cold-Pressed Moroccan Argan & Cedarwood Extract",
      price: 2200,
      priceFormatted: "Rs. 2,200",
      size: "30ml / 1.0 fl oz",
      rating: 5.0,
      badge: "Top Rated",
      desc: "Formulated to soften coarse facial hair, soothe dry skin underneath, and leave an understated cedar-amber aura.",
      image: "assets/images/grooming-products.jpg"
    },
    {
      id: "prod-shave-butter",
      name: "Sandalwood Cooling Shave Butter",
      subtitle: "Shea Butter & Eucalyptus Cooling Infusion",
      price: 1600,
      priceFormatted: "Rs. 1,600",
      size: "200ml / 6.7 oz",
      rating: 4.8,
      badge: "Artisan Made",
      desc: "Ultra-lubricating cushion for seamless straight razor glide, preventing razor burn and irritation completely.",
      image: "assets/images/grooming-products.jpg"
    }
  ],

  vipAddons: [
    { id: "addon-coffee", name: "Artisan Roasted Coffee / Green Tea", price: 0, priceFormatted: "FREE", free: true, desc: "Complimentary beverage served during your service" },
    { id: "addon-towel", name: "Extra Steamed Eucalyptus Towel Compress", price: 500, priceFormatted: "+Rs. 500", free: false, desc: "Aromatherapy relaxation between cuts" },
    { id: "addon-mask", name: "Under-Eye Collagen Recovery Mask", price: 800, priceFormatted: "+Rs. 800", free: false, desc: "Instantly banish fatigue and dark circles" },
    { id: "addon-scalp", name: "Acoustic Scalp & Neck Acupressure", price: 1000, priceFormatted: "+Rs. 1,000", free: false, desc: "10-minute deep relaxation massage" }
  ],

  amenities: [
    { title: "VIP Beverage Bar", desc: "Complimentary fresh espresso, green tea, juices, and chilled mineral water.", icon: "glass" },
    { title: "Luxury Reclining Chairs", desc: "Ergonomic hydraulic salon chairs with integrated neck cushions.", icon: "armchair" },
    { title: "Acoustic Lounge Music", desc: "Relaxing curated lounge soundtrack for a peaceful retreat.", icon: "music" },
    { title: "Private VIP Suites", desc: "Discreet VIP private groom suites available for groom packages.", icon: "shield" }
  ],

  reviews: [
    {
      author: "Hamza Tariq",
      role: "Business Owner, Faisalabad",
      rating: 5,
      date: "2 days ago",
      service: "FlyingScissor VIP Package",
      text: "Hands down the best hair cutting saloon in Faisalabad! Shahzad's scissor control is next level. The cleanliness, VIP hospitality, and finish are unmatched.",
      avatar: "HT"
    },
    {
      author: "Zain Ul Abideen",
      role: "Fashion Consultant",
      rating: 5,
      date: "1 week ago",
      service: "Skin Fade & Beard Lineup",
      text: "Finally a salon in Faisalabad that understands modern styling and textured fades. Ali sculpted my beard to perfection. Worth every rupee!",
      avatar: "ZA"
    },
    {
      author: "Bilal Chaudhry",
      role: "Software Engineer",
      rating: 5,
      date: "2 weeks ago",
      service: "Signature Haircut",
      text: "Booking through the website was super easy, they had my chair ready on the dot. The scalp massage and hair styling were 10/10. Definitely coming back regularly.",
      avatar: "BC"
    }
  ]
};
