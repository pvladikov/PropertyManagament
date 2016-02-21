﻿var app = angular.module('homeApplication', ['ngGrid']);

app.controller('homeController',['$scope','sharedProperties','$http', function ($scope, sharedProperties,$http) {
    $http.get('/property/read').success(function (data) {
        $scope.propertymanagament = data; 
        $scope.searchProperty = '';
    });

    $scope.$watch('property.mortgage', function () {      
        if ($scope.property.mortgage) {
            $scope.property.has_mortgage = true;
        }
        else {
            $scope.property.has_mortgage = false;
        }
    });

    $http.get('/property/getenum').success(function (data) {
        $scope.mannerofpermanentusage = data;
    });
        
     $scope.editProperty = function () {
         $http.post('/property/editproperty').success(function (data) {
             $scope.propertymanagament.push(data);
         });
     };

    //Create New Property
     $scope.newproperty = function () {
        $http.post('/property/create').success(function (data) {
            $scope.propertymanagament.push(data);      
            $scope.property = data;
        });    
    }

    $scope.delete = function (property) {
        if (confirm('Are you sure?')) {
            $http.post('/property/delete', property).success(function (result) {
                if (result) {
                    $scope.propertymanagament.splice($scope.propertymanagament.indexOf(property), 1);
                }
            });
        }
    }

    $scope.update = function (property) {       
            $http.post('/property/update', property).success(function (result) {
                if (result) {
                    //  $scope.propertymanagament.splice($scope.propertymanagament.indexOf(property), 1);
                    $scope.show = false;
                }
            });        
    }

    $scope.edit = function (property) {
        $scope.property = property;
        $scope.addProperty();
        $scope.show = true;
        if ($scope.property.mortgage) {
            $scope.property.has_mortgage = true;
        }
        else {
            $scope.property.has_mortgage = false;
        }
    }
     
    //Create/Delete Mortgage
    $scope.managemortgage = function (property) {
        if (!$scope.property.mortgage) {
            $http.post('/property/createmortgage', property).success(function (data) {
                $scope.property.mortgage = data;               
            });           
        }
        else {
            $scope.property.mortgage = null;
            $http.post('/property/update', property).success(function (result) {
                if (result) {                  
                }
            });
        }
    }
    
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [5, 10, 20],
        pageSize: 5,
        currentPage: 1
    };

    $scope.setPagingData = function (data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.propertymanagament = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                $http.get('/property/read').success(function (data) {
                    data = data.filter(function (item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data, page, pageSize);
                });
            } else {
                $http.get('/property/read').success(function (largeLoad) {
                    $scope.setPagingData(largeLoad, page, pageSize);
                });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);


    $scope.gridOptions = {
        data: 'propertymanagament',
        enablePaging: true,
        showFooter: true,
        enableRowSelection: false,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        columnDefs: [
        { field: 'upi', displayName: 'UPI' },
        { field: 'area', displayName: 'Area' },
        { field: 'manner_of_permanent_usage', displayName: 'Manner of Permanent Usage', width: 250 },
        {
            displayName: 'Actions',
            cellTemplate: '<button type="button" class="btn btn-primary" ng-model="show" ng-click="edit(row.entity)">Modify</button> <button type="button" class="btn btn-primary" ng-click="delete(row.entity)">Delete</button>'
        }
        ]
    };

    $scope.addProperty = function () {       
        sharedProperties.addProperty($scope.property);      
    };

}])
    .service('sharedProperties', function () {
        var data = null;

        return {
            getProperty:function () {
                // This exposed private data
                return data;
            },

            addProperty: function (property) {
                data = property;
            }       
        };
    });

 