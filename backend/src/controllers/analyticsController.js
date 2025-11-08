const Transaction = require('../models/Transaction');
const { buildTransactionFilters } = require('../utils/queryBuilder');

exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const filters = buildTransactionFilters(req.query, req.user._id);

    const results = await Transaction.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return res.json({ data: results });
  } catch (error) {
    return next(error);
  }
};

exports.getMonthlySummary = async (req, res, next) => {
  try {
    const filters = buildTransactionFilters(req.query, req.user._id);

    const results = await Transaction.aggregate([
      { $match: filters },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    return res.json({ data: results });
  } catch (error) {
    return next(error);
  }
};

exports.getNetBalance = async (req, res, next) => {
  try {
    const filters = buildTransactionFilters(req.query, req.user._id);

    const [result] = await Transaction.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
        },
      },
    ]);

    if (!result) {
      return res.json({ data: { income: 0, expense: 0, net: 0 } });
    }

    return res.json({ data: result });
  } catch (error) {
    return next(error);
  }
};
