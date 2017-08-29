const fs = require('fs-extra');
const uuid = require('uuid/v4');
const _ = require('lodash');

const storesJson = fs.readJSONSync('database.data.stores.origin.json');

let menuGroups = {};

let menus = {};

const stores = storesJson
  .map(store => {
    store.id = uuid();
    store.menus = {};
    const storeMenuGroups = store.menuGroups
      .map(menuGroup => {
        menuGroup.id = uuid();
        menuGroup.menuCount = menuGroup.menus.length;

        const menuGroupMenus = menuGroup.menus.reduce((a, b) => {
          b.id = uuid();
          b.menuGroupId = menuGroup.id;
          b.storeId = store.id;
          b.favoriteUsers = {};
          b.favoriteUserCount = 0;
          a[b.id] = b;
          delete b.id;
          delete b.sortOrder;
          return a;
        }, {});

        menus = Object.assign({}, menus, menuGroupMenus);
        menuGroup.menus = _.mapValues(menuGroupMenus, 'sortOrder');
        store.menus = Object.assign({}, store.menus, menuGroup.menus);

        return menuGroup;
      })
      .reduce((a, b) => {
        b.storeId = store.id;
        b.favoriteUsers = {};
        b.favoriteUserCount = 0;
        a[b.id] = b;
        delete b.id;
        delete b.sortOrder;
        return a;
      }, {});

    store.menuGroupCount = Object.keys(storeMenuGroups).length;
    store.menuCount = Object.keys(menus).length;

    menuGroups = Object.assign({}, menuGroups, storeMenuGroups);
    store.menuGroups = _.mapValues(storeMenuGroups, 'sortOrder');

    store.timeFrom = store.time && store.time.from ? store.time.from : null;
    store.timeTo = store.time && store.time.to ? store.time.to : null;
    delete store.time;

    return store;
  })
  .reduce((a, b) => {
    b.favoriteUsers = {};
    b.favoriteUserCount = 0;
    a[b.id] = b;
    delete b.id;
    delete b.sortOrder;
    return a;
  }, {});

fs.writeJSONSync('database.data.stores.json', stores, { spaces: 2 });
fs.writeJSONSync('database.data.menuGroups.json', menuGroups, { spaces: 2 });
fs.writeJSONSync('database.data.menus.json', menus, { spaces: 2 });
