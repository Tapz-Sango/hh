const fs = require('fs');
const path = require('path');

const dataDirectory = path.join(__dirname, '../data');

const ensureFile = (fileName) => {
  const filePath = path.join(dataDirectory, fileName);
  if (!fs.existsSync(dataDirectory)) fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
  return filePath;
};

const createStore = (fileName) => {
  const filePath = ensureFile(fileName);

  const read = () => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.trim() ? JSON.parse(content) : [];
    } catch (error) {
      throw new Error(`Unable to read ${fileName}: ${error.message}`);
    }
  };

  const write = (items) => {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  };

  return {
    findAll: () => read(),
    findById: (id) => read().find(item => item.id === String(id)),
    findOne: (predicate) => read().find(predicate),
    create: (data) => {
      const items = read();
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      };
      items.push(item);
      write(items);
      return item;
    },
    update: (id, updates) => {
      const items = read();
      const index = items.findIndex(item => item.id === String(id));
      if (index === -1) return null;
      items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
      write(items);
      return items[index];
    },
    delete: (id) => {
      const items = read();
      const filtered = items.filter(item => item.id !== String(id));
      if (filtered.length === items.length) return false;
      write(filtered);
      return true;
    }
  };
};

module.exports = {
  usersDB: createStore('users.json'),
  servicesDB: createStore('services.json'),
  bookingsDB: createStore('bookings.json')
};
