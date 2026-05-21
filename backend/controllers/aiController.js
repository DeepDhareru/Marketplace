const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const generateDescription = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name) return res.status(400).json({ message: 'Product name is required' });

    console.log('Generating description for:', name, category);

    const result = await hf.chatCompletion({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      messages: [
        {
          role: 'user',
          content: `Write a 2-3 sentence product description for an e-commerce store.
Product Name: ${name}
Category: ${category || 'General'}
Price: ₹${price || ''}

Rules:
- Only 2-3 sentences
- No bullet points
- Highlight key benefits
- Sound persuasive
- End with value proposition
- Return only the description, nothing else`,
        },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    const description = result.choices[0].message.content.trim();
    console.log('Generated:', description);
    res.json({ description });

  } catch (error) {
    console.error('HF Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to generate description' });
  }
};

module.exports = { generateDescription };