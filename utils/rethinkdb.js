import connection from '../config/index.js';
import rethinkdb from 'rethinkdb';

export const hasItem = async (table, item) => {
    try {
        const cursor = await rethinkdb.table(table).filter(item).run(connection);
        const result = await cursor.toArray();
        return result.length > 0;
    } catch (error) {
        console.error(`hasItem error in table "${table}":`, error);
        return false;
    }
};

export const createItem = async (table, item) => {
    try {
        const result = await rethinkdb.table(table).insert(item).run(connection);
        return result;
    } catch (error) {
        console.error(`createItem error in table "${table}":`, error);
        return null;
    }
};

export const updateItem = async (table, updates, where) => {
    try {
        const result = await rethinkdb.table(table).filter(where).update(updates).run(connection);
        return result;
    } catch (error) {
        console.error(`updateItem error in table "${table}":`, error);
        return null;
    }
};

export const deleteItem = async (table, where) => {
    try {
        const result = await rethinkdb.table(table).filter(where).delete().run(connection);
        return result;
    } catch (error) {
        console.error(`deleteItem error in table "${table}":`, error);
        return null;
    }
};

export const getItem = async (table, where) => {
    try {
        const cursor = await rethinkdb.table(table).filter(where).limit(1).run(connection);
        const result = await cursor.toArray();
        return result;
    } catch (error) {
        console.error(`getItem error in table "${table}":`, error);
        return null;
    }
};

export const getAllItems = async (table, where = {}) => {
    try {
        let query = rethinkdb.table(table);

        if (where && Object.keys(where).length > 0) {
            query = query.filter(where);
        }

        const cursor = await query.run(connection);
        const result = await cursor.toArray();

        return result;
    } catch (error) {
        console.error(`getAllItems error in table "${table}":`, error);
        return null;
    }
};

export const getCount = async (table, where) => {
    try {
        const result = await rethinkdb.table(table).filter(where).count().run(connection);
        return result;
    } catch (error) {
        console.error(`getCount error in table "${table}":`, error);
        return null;
    }
};

export const getCountAll = async (table) => {
    try {
        const result = await rethinkdb.table(table).count().run(connection);
        return result;
    } catch (error) {
        console.error(`getCountAll error in table "${table}":`, error);
        return null;
    }
};

export const createTable = async (table) => {
    try {
        const result = await rethinkdb.tableCreate(table).run(connection);
        return result;
    } catch (error) {
        console.error(`createTable error for "${table}":`, error);
        return null;
    }
};

export const hasTable = async (table) => {
    try {
        const result = await rethinkdb.tableList().run(connection);
        return result.includes(table);
    } catch (error) {
        console.error(`hasTable error for "${table}":`, error);
        return false;
    }
};

export const getPaginatedItems = async (
    table,
    where = {},
    page = 1,
    limit = 10,
    orderByField = 'createdAt',
    sortDirection = 'desc'
) => {
    try {
        const offset = (page - 1) * limit;

        let baseQuery = rethinkdb.table(table);

        // Filter first
        if (where && Object.keys(where).length > 0) {
            baseQuery = baseQuery.filter(where);
        }

        // Then sort
        if (orderByField) {
            if (sortDirection === 'desc') {
                baseQuery = baseQuery.orderBy(rethinkdb.desc(orderByField));
            } else {
                baseQuery = baseQuery.orderBy(rethinkdb.asc(orderByField));
            }
        }

        // Then apply pagination
        const paginatedQuery = baseQuery.skip(offset).limit(limit);
        const cursor = await paginatedQuery.run(connection);
        const results = await cursor.toArray();

        // Get total count (filtered)
        const total = await rethinkdb.table(table).filter(where).count().run(connection);

        return {
            data: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error(`getPaginatedItems error in table "${table}":`, error);
        return {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 }
        };
    }
};

// Get one item within a specific datetime range
export const getItemInDateRange = async (table, field, startDate, endDate) => {
    try {
        const cursor = await rethinkdb
            .table(table)
            .filter(row =>
                row(field)
                    .ge(new Date(startDate))
                    .and(row(field).le(new Date(endDate)))
            )
            .limit(1)
            .run(connection);

        const result = await cursor.toArray();
        return result.length ? result[0] : null;
    } catch (error) {
        console.error(`getItemInDateRange error in table "${table}":`, error);
        return null;
    }
};

// Get multiple items within a specific datetime range
export const getItemsInDateRange = async (table, field, startDate, endDate) => {
    try {
        const cursor = await rethinkdb
            .table(table)
            .filter(row =>
                row(field)
                    .ge(new Date(startDate))
                    .and(row(field).le(new Date(endDate)))
            )
            .run(connection);

        const result = await cursor.toArray();
        return result;
    } catch (error) {
        console.error(`getItemsInDateRange error in table "${table}":`, error);
        return [];
    }
};

export default {
    hasItem,
    createItem,
    updateItem,
    deleteItem,
    getItem,
    getAllItems,
    getCount,
    getCountAll,
    createTable,
    hasTable,
    getPaginatedItems,
    getItemInDateRange,
    getItemsInDateRange
};
