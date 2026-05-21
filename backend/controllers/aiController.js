const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const generateDescription = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name) return res.status(400).json({ message: 'Product name is required' });

    console.log('Generating description for:', name, category);
    console.log('HF Key exists:', !!process.env.HUGGINGFACE_API_KEY);

    const prompt = `Write a 2-3 sentence product description for: ${name}. Category: ${category}. Price: Rs.${price}. Be persuasive and mention key benefits.`;

    const result = await hf.textGeneration({
      model: 'facebook/opt-1.3b',
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        return_full_text: false,
      },
    });

    console.log('HF Result:', result);

    const description = result.generated_text.trim();
    res.json({ description });

  } catch (error) {
    console.error('Full HF error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate description' });
  }
};

module.exports = { generateDescription };