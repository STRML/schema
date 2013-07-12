database = new Database;
sidebar = new Sidebar;
toolbar = new Toolbar;
view = new View;
pane = new Pane;

var SchemaRouter = Backbone.Router.extend({
    routes: {
        "database/:database/:table/" : "viewTable",
        "database/:database/"        : "viewDatabase",
        "database/"                  : "listDatabases",
        "servers/"                   : "showServerPicker",
        ""                           : "redirectToServerPicker",
    },
    
    redirectToServerPicker: function() {
        if (window.token) {
            window.location = "#/database/";
        } else {
            window.location = "#/servers/";
        }
    },
    
    needLogin: function() {
        if (!window.token) {
            var token = localStorage['token'];
            
            if (token) {
                window.token = token;
            } else {
                window.location = "#/servers/";
            }
        }
    },
    
    showServerPicker: function() {
        toolbar.clear();
        sidebar.clear();
        var login = new Login();
        login.displayLogin();
    },
    
    viewDatabase: function(database_name) {
        this.needLogin();
        
        // Populate left nav (database switcher):
        database.queryOrLogout('USE `' + database_name + '`;', function (rows) {
            database.queryOrLogout('SHOW TABLES;', function (rows) {
                sidebar.clear();
                
                _.each(rows, function (row) {
                    var table_name = row[_.keys(row)[0]];
                    sidebar.addItem(table_name, '', '#/database/' + database_name + '/' + table_name + '/');
                });
            });
        });
    },
    
    viewTable: function(database_name, table_name) {
        this.needLogin();
        
        table = new Table(table_name);
        query = new Query();
        query.loadFromTable(table, function() {
            contentview = new ContentView(table);
        });
        
        // Populate left nav (database switcher):
        sidebar.populateFromDatabase(database_name, table_name);
    },
    
    listDatabases: function (server_id) {
        this.needLogin();
        sidebar.clear();
        toolbar.clear();
        
        var databases = new DatabasePicker();
        databases.displayPicker();
    },
});

$(function() {
    var router = new SchemaRouter();
    Backbone.history.start();
});
