function normalizeCategories(category) {
  const categories = Array.isArray(category)
    ? category
    : String(category)
        .split(',')
        .map((item) => item.trim());

  return categories.filter(Boolean);
}

function buildTransactionFilters(query, userId) {
  const { startDate, endDate, category, type, minAmount, maxAmount } = query;

  const filters = { userId };

  if (type && ['income', 'expense'].includes(type.toLowerCase())) {
    filters.type = type.toLowerCase();
  }

  if (category) {
    const categories = normalizeCategories(category);
    if (categories.length) {
      filters.category = { $in: categories };
    }
  }

  if (startDate || endDate) {
    const range = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        range.$gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        range.$lte = end;
      }
    }
    if (Object.keys(range).length) {
      filters.date = range;
    }
  }

  if (minAmount || maxAmount) {
    const amountRange = {};
    if (minAmount && !Number.isNaN(Number(minAmount))) {
      amountRange.$gte = Number(minAmount);
    }
    if (maxAmount && !Number.isNaN(Number(maxAmount))) {
      amountRange.$lte = Number(maxAmount);
    }
    if (Object.keys(amountRange).length) {
      filters.amount = amountRange;
    }
  }

  return filters;
}

function buildSort(query) {
  const { sort } = query;

  if (!sort) {
    return { date: -1 };
  }

  const sortParts = String(sort)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!sortParts.length) {
    return { date: -1 };
  }

  return sortParts.reduce((acc, part) => {
    const [field, order] = part.split(':');
    if (!field) return acc;
    const normalizedOrder = order && order.toLowerCase() === 'asc' ? 1 : -1;
    acc[field] = normalizedOrder;
    return acc;
  }, {});
}

module.exports = {
  buildTransactionFilters,
  buildSort,
};
