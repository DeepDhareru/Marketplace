const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const generateReferralCode = (name) => {
  const prefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${suffix}`;
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.collection('users');
  const users = await db.find({ referralCode: { $exists: false } }).toArray();
  console.log(`Updating ${users.length} users...`);
  for (const user of users) {
    let code = generateReferralCode(user.name || 'USR');
    await db.updateOne(
      { _id: user._id },
      { $set: { referralCode: code, referralCredits: 0, referredBy: null } }
    );
  }
  console.log('Done!');
  process.exit();
});