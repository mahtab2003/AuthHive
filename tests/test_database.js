import actions from '../utils/rethinkdb.js';
import { v4 as uuidv4 } from 'uuid';

const testDatabase = async () => {
    try {
        if (!actions.hasTable('test')) {
            const testTable = await actions.createTable('test');
        }
        const id = uuidv4();
        const test = await actions.createItem('test', { id: uuidv4(), name: 'Test Item' });
        console.log("Test item created:", test);
        const allItems = await actions.getAllItems('test');
        console.log("All items:", allItems);
        const item = await actions.getItem('test', { id: id });
        console.log("Item retrieved:", item);
        const count = await actions.getCount('test', { id: id });
        console.log("Count of items:", count);
        const countAll = await actions.getCountAll('test');
        console.log("Count of all items:", countAll);
        const updatedItem = await actions.updateItem('test', { id: id }, { name: 'Updated Test Item' });
        console.log("Updated item:", updatedItem);
        const deletedItem = await actions.deleteItem('test', { id: id });
        console.log("Deleted item:", deletedItem);
        const allItemsAfterUpdate = await actions.getAllItems('test');
        console.log("All items after update:", allItemsAfterUpdate);
    } catch (error) {
        console.error("Error creating test item:", error);
    }
}

testDatabase();