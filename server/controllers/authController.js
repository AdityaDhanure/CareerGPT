import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function createToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export const registerUser = async (req, res) => {
  try{
    const name = req.body.data.name;
    const email = req.body.data.email;
    const password = req.body.data.password;
    const photoURL = req.body.data.photoURL || '';

    const hashPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({
      email: email
    })
    if( existingUser ) {
      return res.status(409).json({ msg: 'User already exists' });
    }
    const user = await User.create({ name, email, password: hashPassword, photoURL });
    const token = createToken(user);
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        photoURL: user.photoURL,
      },
      msg: 'User registered successfully',
      token: token
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ 
      msg: 'Server error during registration' 
    });
  }
};

export const loginUser = async (req, res) => {
  try{
    const { email, password } = req.body.data;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        msg: 'User does not exist! or Invalid Email or Password.'
      });
    }
    const token = createToken(user);
    res.json({
      msg: 'Login successful',
      token: token
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ 
      msg: 'Server error during login' 
    });
  }
};

export const googleLogin = async (req, res) => {
  try{
    const { email, name, photoURL } = req.body.data;
    let user = await User.find({ email });
    if( user.length === 0 ) {
      user = await User.create({ name, email, photoURL });
    }
    else {
      user = user[0];
    }
    const token = createToken(user);
    res.json({
      msg: 'Google login successful',
      user: {
        id: user._id,
        email: user.email,
        photoURL: user.photoURL,
      },
      token: token
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ 
      msg: 'Server error during Google login' 
    });
  }
}

export const findUser = async (req, res) => {
  try{
    const user = await User.findOne({
      _id: req.id
    });
    // console.log('User: ', user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
      photoURL: user.photoURL || '',
      createdAt: user.createdAt,
      password: user.password || ''
    });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ 
      msg: 'Server error while finding user' 
    });
  }
} 

export const editUser = async (req, res) => {
  try {
    const { name, currentPassword, newPassword, createPassword, confirmPassword } = req.body;

    const user = await User.findById(req.id);
    if (!user) return res.status(404).json({ 
      msg: 'User not found' 
    });

    // If password change is requested
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ 
        msg: 'Incorrect current password' 
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // If create password is requested
    if (createPassword && confirmPassword) {
      if (createPassword !== confirmPassword) {
        return res.status(400).json({ 
          msg: 'Passwords do not match' 
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(createPassword, salt);
    }

    // If name is provided and different, update it
    if (name && name !== user.name) {
      user.name = name;
    }

    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      name: user.name
    });

  } catch (err) {
    res.status(500).json({
      msg: 'Server error',
      error: err.message
    });
  }
};
