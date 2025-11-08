const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { buildTransactionFilters, buildSort } = require('../utils/queryBuilder');

exports.createTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, date, description } = req.body;

    if (!type || !category || amount == null || !date) {
      return res
        .status(400)
        .json({ message: 'Type, category, amount, and date are required.' });
    }

    if (!['income', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({ message: 'Type must be income or expense.' });
    }

    const normalizedCategory = String(category).trim();
    if (!normalizedCategory) {
      return res.status(400).json({ message: 'Category is required.' });
    }

    const normalizedAmount = Number(amount);
    if (Number.isNaN(normalizedAmount) || normalizedAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number.' });
    }

    const normalizedDate = new Date(date);
    if (Number.isNaN(normalizedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date provided.' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: type.toLowerCase(),
      category: normalizedCategory,
      amount: normalizedAmount,
      date: normalizedDate,
      description,
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const filters = buildTransactionFilters(req.query, req.user._id);
    const sort = buildSort(req.query);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filters).sort(sort).skip(skip).limit(limit),
      Transaction.countDocuments(filters),
    ]);

    return res.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID.' });
    }

    const updates = { ...req.body };
    if (updates.type && !['income', 'expense'].includes(updates.type.toLowerCase())) {
      return res.status(400).json({ message: 'Type must be income or expense.' });
    }

    if (updates.type) {
      updates.type = updates.type.toLowerCase();
    }

    if (updates.category !== undefined) {
      const normalizedCategory = String(updates.category).trim();
      if (!normalizedCategory) {
        return res.status(400).json({ message: 'Category is required.' });
      }
      updates.category = normalizedCategory;
    }

    if (updates.amount !== undefined) {
      const normalizedAmount = Number(updates.amount);
      if (Number.isNaN(normalizedAmount) || normalizedAmount < 0) {
        return res.status(400).json({ message: 'Amount must be a non-negative number.' });
      }
      updates.amount = normalizedAmount;
    }

    if (updates.date) {
      const normalizedDate = new Date(updates.date);
      if (Number.isNaN(normalizedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date provided.' });
      }
      updates.date = normalizedDate;
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    return res.json(transaction);
  } catch (error) {
    return next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID.' });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
