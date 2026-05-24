const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateReferralCode = require('../utils/generateReferralCode');
const createNotification = require('../utils/createNotification');

const REFERRAL_BONUS = 50; // ₹50 credit for referrer
const REFEREE_BONUS = 30;  // ₹30 credit for new user

const register = async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code for new user
    let newReferralCode = generateReferralCode(name);
    while (await User.findOne({ referralCode: newReferralCode })) {
      newReferralCode = generateReferralCode(name);
    }

    // Find referrer if code provided
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      referralCode: newReferralCode,
      referredBy: referrer?._id || null,
      referralCredits: referrer ? REFEREE_BONUS : 0,
    });

    // Give referrer their bonus
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCredits: REFERRAL_BONUS },
      });

      // Notify referrer
      await createNotification({
        userId: referrer._id,
        title: '🎉 Referral Bonus!',
        message: `${name} joined using your referral code. You earned ₹${REFERRAL_BONUS} credits!`,
        type: 'system',
        link: '/referral',
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      referralCredits: user.referralCredits,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account banned' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      referralCredits: user.referralCredits,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({
      name: updated.name,
      email: updated.email,
      address: updated.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { label, address, isDefault } = req.body;
    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push({ label, address, isDefault });
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email createdAt')
      .sort({ createdAt: -1 });

    res.json({
      referralCode: user.referralCode,
      referralCredits: user.referralCredits,
      totalReferrals: referrals.length,
      referrals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyReferralCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    if (user.referralCredits < amount) {
      return res.status(400).json({ message: 'Insufficient referral credits' });
    }

    user.referralCredits -= amount;
    await user.save();
    res.json({ message: 'Credits applied', remainingCredits: user.referralCredits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register, login, getProfile, updateProfile,
  addAddress, deleteAddress, getAddresses,
  getReferralStats, applyReferralCredits,
};