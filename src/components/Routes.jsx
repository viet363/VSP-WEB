import React from 'react';
import { Route, Switch } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import Categorys from '../pages/Category';
import Chats from '../pages/Chat';
import Inventory from '../pages/Inventory';
import InventoryExport from '../pages/InventoryExport';
import InventoryImport from '../pages/InventoryImport';
import InventoryLogs from '../pages/InventoryLogs';
import Warehouses from '../pages/Warehouses';

const Routes = () => {
    return (
        <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />

            <Route path="/chats" component={Chats} />

            <ProtectedRoute path="/dashboard" exact component={Dashboard} />
            <ProtectedRoute path="/customers" component={Customers} />
            <ProtectedRoute path="/products" component={Products} />
            <ProtectedRoute path="/orders" component={Orders} />
            <ProtectedRoute path="/categories" component={Categorys} />
            <ProtectedRoute path="/inventory" component={Inventory} />
            <ProtectedRoute path="/inventoryexport" component={InventoryExport} />
            <ProtectedRoute path="/inventoryimport" component={InventoryImport} />
            <ProtectedRoute path="/inventorylogs" component={InventoryLogs} />
            <ProtectedRoute path="/warehouses" component={Warehouses} />
        </Switch>
    );
};

export default Routes;