const generateDescription = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name) return res.status(400).json({ message: 'Product name is required' });

    const templates = {
      Electronics: [
        `${name} delivers cutting-edge performance with premium build quality. Designed for everyday use, it combines reliability with modern technology. An excellent investment for anyone seeking quality at ₹${price}.`,
        `Experience superior functionality with the ${name}. Built with advanced technology and durable materials, it's engineered to exceed your expectations. Get the best value for your money at just ₹${price}.`,
        `The ${name} redefines what you expect from electronics. Packed with features and built to last, it's the perfect blend of performance and value. Upgrade your experience today for ₹${price}.`,
      ],
      Clothing: [
        `The ${name} combines comfort and style effortlessly. Made from premium quality fabric, it's perfect for all occasions and ensures you look your best every day. Available now at just ₹${price}.`,
        `Step up your wardrobe with the ${name}. Crafted for both style and durability, this piece offers a perfect fit and lasting comfort. A must-have addition at ₹${price}.`,
        `Elevate your fashion game with the ${name}. Designed with attention to detail and made from quality materials, it's the perfect choice for any occasion at ₹${price}.`,
      ],
      Books: [
        `${name} is a must-read that will transform your perspective and expand your knowledge. Written with clarity and depth, it's perfect for readers of all levels. Grab your copy today for just ₹${price}.`,
        `Dive into the world of ${name} and unlock new insights. This book offers practical wisdom and engaging content that keeps you hooked from start to finish. An invaluable read at ₹${price}.`,
        `${name} is your guide to mastering new ideas and concepts. Packed with actionable insights and expert knowledge, it's an essential addition to your library at ₹${price}.`,
      ],
      Home: [
        `Transform your living space with the ${name}. Combining functionality with elegant design, it's the perfect addition to any modern home. Enhance your lifestyle today for just ₹${price}.`,
        `The ${name} brings both style and practicality to your home. Built with quality materials and thoughtful design, it's made to last and impress. Available at the unbeatable price of ₹${price}.`,
        `Upgrade your home with the premium ${name}. Designed for convenience and built for durability, it perfectly complements any interior style. An excellent choice at ₹${price}.`,
      ],
      Sports: [
        `Take your performance to the next level with the ${name}. Engineered for athletes and fitness enthusiasts, it delivers professional-grade results. Achieve your fitness goals for just ₹${price}.`,
        `The ${name} is your ultimate companion for fitness and sports. Built with high-quality materials and ergonomic design, it supports your active lifestyle perfectly. Get started at ₹${price}.`,
        `Push your limits with the ${name}. Designed for durability and peak performance, it's the equipment every serious athlete needs. Invest in your fitness journey for ₹${price}.`,
      ],
      Other: [
        `The ${name} is a premium quality product designed to meet your everyday needs. Built with attention to detail and superior craftsmanship, it offers unmatched value at ₹${price}.`,
        `Discover the difference with ${name}. Crafted for quality and designed for longevity, it's a smart choice for anyone who values the best. Available now at just ₹${price}.`,
        `${name} stands out for its exceptional quality and thoughtful design. Whether for personal use or gifting, it's a choice you won't regret at ₹${price}.`,
      ],
    };

    const categoryTemplates = templates[category] || templates['Other'];
    const randomIndex = Math.floor(Math.random() * categoryTemplates.length);
    const description = categoryTemplates[randomIndex];

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate description' });
  }
};

module.exports = { generateDescription };