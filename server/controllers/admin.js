//hi
const shopItemModel = require("../models/shop-item");
const bcrypt = require("bcrypt");
const admin = require("../models/admin");
const customer = require("../models/customer");
const jwt = require("jsonwebtoken");
const passwordValidator = require('password-validator');

const proveOfLife = async (req, res) => {
  try {
    res.status(200).json({ message: 'Alive' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    // check password strength, using a library
    const schema = new passwordValidator();
    schema
      .is().min(8)                                    // Minimum length 8
      .has().uppercase();                             // Must have uppercase letters
    const valid = schema.validate(password);
    if (!valid) {
      res.status(200).json({ message: "Password should include 1 uppercase letter and have 8 characters or more" });
    }
    // check email exists
    const exists = await admin.findOne({ email });
    if (exists) {
      res.status(200).json({ message: `Email ${email} already exists.` });
    }
    // Hash the supplied password before saving to databse
    const hashed = await hash(password);
    // Save to databse
    const user = await admin.create({
      name,
      email,
      hashedPassword: hashed,
    });
    const token = jwt.sign({ userId: user._id, isAdmin: true }, process.env.Access_Token_Key, { expiresIn: '24h' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 }); // maxAge is in milliseconds (24 hours)
    res.status(200).json({ message: 'New admin account created successfully', token });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminAccount = await admin.findOne({ email });
    if (!adminAccount) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isValidPass = await bcrypt.compare(password, adminAccount.hashedPassword);
    if (!isValidPass) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: adminAccount._id, isAdmin: true }, process.env.Access_Token_Key, { expiresIn: '24h' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 }); // maxAge is in milliseconds (24 hours)
    res.status(200).json({ message: 'Signin successful', token });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const signout = async (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.status(200).json({ message: 'Signout successful' });
}

const getCustomers = async (req, res) => {
  try {
    const customers = await customer.find({});

    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: 'No customers found' });
    }
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
//orders
const getOrders = async (req, res) => {
  try {
    //populate() method is used to replace the shopItemsRef field in each order with the actual documents from the shop-item collection. 
    const customersWithOrders = await customer.find();
    if (!customersWithOrders || customersWithOrders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }
    const allOrders = customersWithOrders.map(customer => ({
      items: customer.order.items || [], // order contains an array of shopItem references
      numberOfItems: customer.order.numberOfItems,
      totalPrice: customer.order.totalPrice,
      date: customer.order.date,
      customerName: customer.name,
      customerEmail: customer.email,
      customerGender: customer.gender 
    }));
    res.status(200).json({ orders: allOrders })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

}
const removeItems = async (req, res) => {
  try {
    const { itemsIds } = req.body;
    if (!itemsIds || typeof(itemsIds) != 'string') {
      return res.status(400).json({ message: "Invalid Items Id's" })
    }
    const checkExist = await shopItemModel.findById(itemsIds);
    if (!checkExist) {
      return res.status(400).json({ message: "Item not exist" })
    }
    const deletedItems = await shopItemModel.deleteMany({ _id: { $in: itemsIds } });
    if (deletedItems.deletedCount === 0) {
      return res.status(404).json({ message: "No Item found" })
    }

    return res.status(200).json({ message: "Items deleted successfully" })

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const searchItems = async (req, res) => {
  const { title, genre, minPrice, maxPrice } = req.query;
  const query = {};
  if (title) query.title = { $regex: new RegExp(title, 'i') };//$regex: Provides regular expression capabilities for pattern matching strings in queries. i: Case-insensitive
  if (genre) query.genre = genre;
  if (minPrice || maxPrice) {
    if (minPrice && maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (minPrice && !maxPrice) {
      query.price = { $gte: minPrice};
    }
    if (!minPrice && maxPrice) {
      query.price = { $lte: maxPrice };
    }
  }

  try {
    const items = await shopItemModel.find(query);
    if (items.length > 0) {
      res.status(200).json({ message: "Search Result", items });
    }
    else {
      res.status(404).json({ message: "No Items found" })
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching items' });
  }
}


const addNewItem = async (req, res) => {
  try {
    const { title, image, price, description, availableCount, genre } = req.body;

    if (!title || !price || !availableCount || !genre) {
      return res.status(400).json({ message: "Title, price, availableCount, and genre are required for a new item" });
    }
    if ( typeof(price) !="number" || typeof(availableCount) !="number") {
      return res.status(400).json({ message: "Price and availableCount must be a number" });
    }
    const newItem = new shopItemModel({ title, image, price, description, availableCount, genre });
    await newItem.save();

    return res.status(201).json({ message: "Item added successfully", newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateItemDetails = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { title, image, price, description, availableCount, genre } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }
    if (description && description.length < 50) {
      return res.status(400).json({ message: "Description can't be less than 50 characters" });
    }
    const item = await shopItemModel.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (title) item.title = title;
    if (image) item.image = image;
    if (price) item.price = price;
    if (description) item.description = description;
    if (availableCount) item.availableCount = availableCount;
    if (genre) item.genre = genre;
    await item.save();

    return res.status(200).json({ message: "Item details updated successfully", updatedItem: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const hash = async (pw) => {
  const saltRounds = 10;
  return await bcrypt.hash(pw, saltRounds);
}

module.exports = {
  removeItems,
  searchItems,
  addNewItem,
  updateItemDetails,
  signin,
  signout,
  getCustomers,
  getOrders,
  proveOfLife,
  register
};



