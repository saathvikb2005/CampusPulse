// Database query helpers and utilities

const mongoose = require('mongoose');

// Generic pagination helper
const paginate = (query, page = 1, limit = 10, populate = null) => {
  const skip = (page - 1) * limit;
  
  let queryBuilder = query.skip(skip).limit(limit);
  
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(pop => {
        queryBuilder = queryBuilder.populate(pop);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }
  
  return queryBuilder;
};

// Get pagination metadata
const getPaginationData = async (model, filter = {}, page = 1, limit = 10) => {
  const totalDocs = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalDocs,
    limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

// Build search query for text fields
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchRegex }
    }))
  };
};

// Build filter query from request parameters
const buildFilterQuery = (filters) => {
  const query = {};
  
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    
    if (value !== undefined && value !== null && value !== '') {
      // Handle array filters (e.g., categories, tags)
      if (Array.isArray(value)) {
        query[key] = { $in: value };
      }
      // Handle date range filters
      else if (key.includes('Date') && typeof value === 'object') {
        if (value.from || value.to) {
          query[key] = {};
          if (value.from) query[key].$gte = new Date(value.from);
          if (value.to) query[key].$lte = new Date(value.to);
        }
      }
      // Handle boolean filters
      else if (typeof value === 'boolean') {
        query[key] = value;
      }
      // Handle string filters
      else {
        query[key] = value;
      }
    }
  });
  
  return query;
};

// Build sort query from request parameters
const buildSortQuery = (sortBy, sortOrder = 'desc') => {
  if (!sortBy) return { createdAt: -1 }; // Default sort
  
  const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  return { [sortBy]: order };
};

// Aggregate query for statistics
const getAggregateStats = async (model, pipeline) => {
  try {
    const result = await model.aggregate(pipeline);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error in aggregate query:', error);
    return null;
  }
};

// Count documents by field values
const getCountByField = async (model, field, filter = {}) => {
  try {
    const pipeline = [
      { $match: filter },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    
    return await model.aggregate(pipeline);
  } catch (error) {
    console.error('Error counting by field:', error);
    return [];
  }
};

// Get documents created in time periods
const getCountByTimePeriod = async (model, field = 'createdAt', periods = 7) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - (periods * 24 * 60 * 60 * 1000));
    
    const pipeline = [
      {
        $match: {
          [field]: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: `$${field}`
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];
    
    return await model.aggregate(pipeline);
  } catch (error) {
    console.error('Error getting count by time period:', error);
    return [];
  }
};

// Validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Convert string to ObjectId
const toObjectId = (id) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid ObjectId');
  }
  return new mongoose.Types.ObjectId(id);
};

// Clean up query parameters
const cleanQueryParams = (params) => {
  const cleaned = {};
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    // Convert string numbers to numbers
    if (typeof value === 'string' && !isNaN(value) && !isNaN(parseFloat(value))) {
      cleaned[key] = parseFloat(value);
    }
    // Convert string booleans to booleans
    else if (value === 'true' || value === 'false') {
      cleaned[key] = value === 'true';
    }
    // Keep other values as is
    else {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

// Soft delete helper
const softDelete = async (model, id, deletedBy) => {
  try {
    const result = await model.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy
      },
      { new: true }
    );
    
    return result;
  } catch (error) {
    console.error('Error in soft delete:', error);
    throw error;
  }
};

// Restore soft deleted document
const restoreDocument = async (model, id) => {
  try {
    const result = await model.findByIdAndUpdate(
      id,
      {
        $unset: {
          isDeleted: 1,
          deletedAt: 1,
          deletedBy: 1
        }
      },
      { new: true }
    );
    
    return result;
  } catch (error) {
    console.error('Error restoring document:', error);
    throw error;
  }
};

// Find documents excluding soft deleted
const findActive = (model, filter = {}) => {
  return model.find({ ...filter, isDeleted: { $ne: true } });
};

module.exports = {
  paginate,
  getPaginationData,
  buildSearchQuery,
  buildFilterQuery,
  buildSortQuery,
  getAggregateStats,
  getCountByField,
  getCountByTimePeriod,
  isValidObjectId,
  toObjectId,
  cleanQueryParams,
  softDelete,
  restoreDocument,
  findActive
};