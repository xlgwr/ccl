var DocsApp = angular.module('docsApp', ['ngMaterial', 'ngRoute', 'angularytics', 'ngMessages'])

.config([
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$routeProvider',
  '$mdThemingProvider',
function(SERVICES, COMPONENTS, DEMOS, PAGES, $routeProvider, $mdThemingProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    })
    .when('/layout/:tmpl', {
      templateUrl: function(params){
        return 'partials/layout-' + params.tmpl + '.tmpl.html';
      }
    })
    .when('/layout/', {
      redirectTo: function() {
        return "/layout/container";
      }
    })
    .when('/demo/', {
      redirectTo: function() {
        return DEMOS[0].url;
      }
    })
    .when('/api/', {
      redirectTo: function() {
        return COMPONENTS[0].docs[0].url;
      }
    })
    .when('/getting-started', {
      templateUrl: 'partials/getting-started.tmpl.html'
    });

  $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('yellow')
    .dark();

  angular.forEach(PAGES, function(pages, area) {
    angular.forEach(pages, function(page) {
      $routeProvider
        .when(page.url, {
          templateUrl: page.outputPath,
          controller: 'GuideCtrl'
        });
    });
  });

  angular.forEach(COMPONENTS, function(component) {
    angular.forEach(component.docs, function(doc) {
      doc.url = '/' + doc.url;
      $routeProvider.when(doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
    });
  });

  angular.forEach(SERVICES, function(service) {
    service.url = '/' + service.url;
    $routeProvider.when(service.url, {
      templateUrl: service.outputPath,
      resolve: {
        component: function() { return undefined; },
        doc: function() { return service; }
      },
      controller: 'ComponentDocCtrl'
    });
  });

  angular.forEach(DEMOS, function(componentDemos) {
    var demoComponent;
    angular.forEach(COMPONENTS, function(component) {
      if (componentDemos.name === component.name) {
        demoComponent = component;
      }
    });
    demoComponent = demoComponent || angular.extend({}, componentDemos);
    $routeProvider.when(componentDemos.url, {
      templateUrl: 'partials/demo.tmpl.html',
      controller: 'DemoCtrl',
      resolve: {
        component: function() { return demoComponent; },
        demos: function() { return componentDemos.demos; }
      }
    });
  });

  $routeProvider.otherwise('/');
}])

.config(['AngularyticsProvider', function(AngularyticsProvider) {
   AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
}])

.run([
   'Angularytics',
   '$rootScope',
    '$timeout',
function(Angularytics, $rootScope,$timeout) {
  Angularytics.init();
}])

.factory('menu', [
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$location',
  '$rootScope',
function(SERVICES, COMPONENTS, DEMOS, PAGES, $location, $rootScope) {

  var sections = [{
    name: 'Getting Started',
    url: '/getting-started',
    type: 'link'
  }];

  var demoDocs = [];
  angular.forEach(DEMOS, function(componentDemos) {
    demoDocs.push({
      name: componentDemos.label,
      url: componentDemos.url
    });
  });

  sections.push({
    name: 'Demos',
    pages: demoDocs.sort(sortByName),
    type: 'toggle'
  });

  sections.push();

  sections.push({
    name: 'Customization',
    type: 'heading',
    children: [{
      name: 'CSS',
      type: 'toggle',
      pages: [{
        name: 'Typography',
        url: '/CSS/typography',
        type: 'link'
      }]
    },{
      name: 'Theming',
      type: 'toggle',
      pages: [{
        name: 'Introduction and Terms',
        url: '/Theming/01_introduction',
        type: 'link'
      },
      {
        name: 'Declarative Syntax',
        url: '/Theming/02_declarative_syntax',
        type: 'link'
      },
      {
        name: 'Configuring a Theme',
        url: '/Theming/03_configuring_a_theme',
        type: 'link'
      },
      {
        name: 'Multiple Themes',
        url: '/Theming/04_multiple_themes',
        type: 'link'
      }]
    }]
  });

  var docsByModule = {};
  var apiDocs = {};
  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      if (angular.isDefined(doc.private)) return;
      apiDocs[doc.type] = apiDocs[doc.type] || [];
      apiDocs[doc.type].push(doc);

      docsByModule[doc.module] = docsByModule[doc.module] || [];
      docsByModule[doc.module].push(doc);
    });
  });

  SERVICES.forEach(function(service) {
    if (angular.isDefined(service.private)) return;
    apiDocs[service.type] = apiDocs[service.type] || [];
    apiDocs[service.type].push(service);

    docsByModule[service.module] = docsByModule[service.module] || [];
    docsByModule[service.module].push(service);
  });

  sections.push({
    name: 'API Reference',
    type: 'heading',
    children: [
    {
      name: 'Layout',
      type: 'toggle',
      pages: [{
        name: 'Container Elements',
        id: 'layoutContainers',
        url: '/layout/container'
      },{
        name: 'Grid System',
        id: 'layoutGrid',
        url: '/layout/grid'
      },{
        name: 'Child Alignment',
        id: 'layoutAlign',
        url: '/layout/alignment'
      },{
        name: 'Options',
        id: 'layoutOptions',
        url: '/layout/options'
      }]
    },
    {
      name: 'Services',
      pages: apiDocs.service.sort(sortByName),
      type: 'toggle'
    },{
      name: 'Directives',
      pages: apiDocs.directive.sort(sortByName),
      type: 'toggle'
    }]
  });

  function sortByName(a,b) {
    return a.name < b.name ? -1 : 1;
  }

  var self;

  $rootScope.$on('$locationChangeSuccess', onLocationChange);

  return self = {
    sections: sections,

    selectSection: function(section) {
      self.openedSection = section;
    },
    toggleSelectSection: function(section) {
      self.openedSection = (self.openedSection === section ? null : section);
    },
    isSectionSelected: function(section) {
      return self.openedSection === section;
    },

    selectPage: function(section, page) {
      self.currentSection = section;
      self.currentPage = page;
    },
    isPageSelected: function(page) {
      return self.currentPage === page;
    }
  };

  function sortByHumanName(a,b) {
    return (a.humanName < b.humanName) ? -1 :
      (a.humanName > b.humanName) ? 1 : 0;
  }

  function onLocationChange() {
    var path = $location.path();

    if (path == '/') {
      self.selectSection(null);
      self.selectPage(null, null);
      return;
    }

    var matchPage = function(section, page) {
      if (path === page.url) {
        self.selectSection(section);
        self.selectPage(section, page);
      }
    };

    sections.forEach(function(section) {
      if(section.children) {
        // matches nested section toggles, such as API or Customization
        section.children.forEach(function(childSection){
          if(childSection.pages){
            childSection.pages.forEach(function(page){
              matchPage(childSection, page);
            });
          }
        });
      }
      else if(section.pages) {
        // matches top-level section toggles, such as Demos
        section.pages.forEach(function(page) {
          matchPage(section, page);
        });
      }
      else if (section.type === 'link') {
        // matches top-level links, such as "Getting Started"
        matchPage(section, section);
      }
    });
  }
}])

.directive('menuLink', function() {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-link.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isSelected = function() {
        return controller.isSelected($scope.section);
      };

      $scope.focusSection = function() {
        // set flag to be used later when
        // $locationChangeSuccess calls openPage()
        controller.autoFocusContent = true;
      };
    }
  };
})

.directive('menuToggle', function() {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-toggle.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isOpen = function() {
        return controller.isOpen($scope.section);
      };
      $scope.toggle = function() {
        controller.toggleOpen($scope.section);
      };

      var parentNode = $element[0].parentNode.parentNode.parentNode;
      if(parentNode.classList.contains('parent-list-item')) {
        var heading = parentNode.querySelector('h2');
        $element[0].firstChild.setAttribute('aria-describedby', heading.id);
      }
    }
  };
})

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  'BUILDCONFIG',
  '$mdSidenav',
  '$timeout',
  '$mdDialog',
  'menu',
  '$location',
  '$rootScope',
  '$log',
function($scope, COMPONENTS, BUILDCONFIG, $mdSidenav, $timeout, $mdDialog, menu, $location, $rootScope, $log) {
  var self = this;

  $scope.COMPONENTS = COMPONENTS;
  $scope.BUILDCONFIG = BUILDCONFIG;
  $scope.menu = menu;

  $scope.path = path;
  $scope.goHome = goHome;
  $scope.openMenu = openMenu;
  $scope.closeMenu = closeMenu;
  $scope.isSectionSelected = isSectionSelected;

  $rootScope.$on('$locationChangeSuccess', openPage);
  $scope.focusMainContent = focusMainContent;

  // Methods used by menuLink and menuToggle directives
  this.isOpen = isOpen;
  this.isSelected = isSelected;
  this.toggleOpen = toggleOpen;
  this.autoFocusContent = false;


  var mainContentArea = document.querySelector("[role='main']");

  // *********************
  // Internal methods
  // *********************

  function closeMenu() {
    $timeout(function() { $mdSidenav('left').close(); });
  }

  function openMenu() {
    $timeout(function() { $mdSidenav('left').open(); });
  }

  function path() {
    return $location.path();
  }

  function goHome($event) {
    menu.selectPage(null, null);
    $location.path( '/' );
  }

  function openPage() {
    $scope.closeMenu();

    if (self.autoFocusContent) {
      focusMainContent();
      self.autoFocusContent = false;
    }
  }

  function focusMainContent($event) {
    // prevent skip link from redirecting
    if ($event) { $event.preventDefault(); }

    $timeout(function(){
      mainContentArea.focus();
    },90);

  }

  function isSelected(page) {
    return menu.isPageSelected(page);
  }

  function isSectionSelected(section) {
    var selected = false;
    var openedSection = menu.openedSection;
    if(openedSection === section){
      selected = true;
    }
    else if(section.children) {
      section.children.forEach(function(childSection) {
        if(childSection === openedSection){
          selected = true;
        }
      });
    }
    return selected;
  }

  function isOpen(section) {
    return menu.isSectionSelected(section);
  }

  function toggleOpen(section) {
    menu.toggleSelectSection(section);
  }
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
  '$http',
function($scope, $rootScope, $http) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;

  $scope.version = "";
  $scope.versionURL = "";

  // Load build version information; to be
  // used in the header bar area
  var now = Math.round(new Date().getTime()/1000);
  var versionFile = "version.json" + "?ts=" + now;

  $http.get("version.json")
    .then(function(response){
      var sha = response.data.sha || "";
      var url = response.data.url;

      if (sha) {
        $scope.versionURL = url + sha;
        $scope.version = sha.substr(0,6);
      }
    });


}])


.controller('GuideCtrl', [
  '$rootScope',
function($rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
}])

.controller('LayoutCtrl', [
  '$scope',
  '$attrs',
  '$location',
  '$rootScope',
function($scope, $attrs, $location, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;

  $scope.layoutDemo = {
    mainAxis: 'center',
    crossAxis: 'center',
    direction: 'row'
  };
  $scope.layoutAlign = function() {
    return $scope.layoutDemo.mainAxis + ' ' + $scope.layoutDemo.crossAxis;
  };
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
  '$templateCache',
  '$http',
  '$q',
function($scope, doc, component, $rootScope, $templateCache, $http, $q) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = doc;
}])

.controller('DemoCtrl', [
  '$rootScope',
  '$scope',
  'component',
  'demos',
  '$http',
  '$templateCache',
  '$q',
function($rootScope, $scope, component, demos, $http, $templateCache, $q) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = null;

  $scope.demos = [];

  angular.forEach(demos, function(demo) {
    // Get displayed contents (un-minified)
    var files = [demo.index]
      .concat(demo.js || [])
      .concat(demo.css || [])
      .concat(demo.html || []);
    files.forEach(function(file) {
      file.httpPromise =$http.get(file.outputPath, {cache: $templateCache})
        .then(function(response) {
          file.contents = response.data
            .replace('<head/>', '');
          return file.contents;
        });
    });
    demo.$files = files;
    $scope.demos.push(demo);
  });

  $scope.demos = $scope.demos.sort(function(a,b) {
    return a.name > b.name ? 1 : -1;
  });

}])

.filter('nospace', function () {
  return function (value) {
    return (!value) ? '' : value.replace(/ /g, '');
  };
})
.filter('humanizeDoc', function() {
  return function(doc) {
    if (!doc) return;
    if (doc.type === 'directive') {
      return doc.name.replace(/([A-Z])/g, function($1) {
        return '-'+$1.toLowerCase();
      });
    }
    return doc.label || doc.name;
  };
})

.filter('directiveBrackets', function() {
  return function(str) {
    if (str.indexOf('-') > -1) {
      return '<' + str + '>';
    }
    return str;
  };
})
;

DocsApp.constant('BUILDCONFIG', {
  "ngVersion": "1.3.15",
  "version": "0.9.0-rc2",
  "repository": "https://github.com/angular/material",
  "commit": "4a648d55578a2d54e64bfc0b3f1dec5fa73bef57",
  "date": "2015-04-24 18:54:19 -0700"
});

DocsApp
.constant('COMPONENTS', [
  {
    "name": "material.components.bottomSheet",
    "type": "module",
    "outputPath": "partials/api/material.components.bottomSheet/index.html",
    "url": "api/material.components.bottomSheet",
    "label": "material.components.bottomSheet",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "$mdBottomSheet",
        "type": "service",
        "outputPath": "partials/api/material.components.bottomSheet/service/$mdBottomSheet.html",
        "url": "api/material.components.bottomSheet/service/$mdBottomSheet",
        "label": "$mdBottomSheet",
        "hasDemo": false,
        "module": "material.components.bottomSheet",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/bottomSheet/bottomSheet.js"
      }
    ]
  },
  {
    "name": "material.components.button",
    "type": "module",
    "outputPath": "partials/api/material.components.button/index.html",
    "url": "api/material.components.button",
    "label": "material.components.button",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdButton",
        "type": "directive",
        "outputPath": "partials/api/material.components.button/directive/mdButton.html",
        "url": "api/material.components.button/directive/mdButton",
        "label": "mdButton",
        "hasDemo": true,
        "module": "material.components.button",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/button/button.js"
      }
    ]
  },
  {
    "name": "material.components.card",
    "type": "module",
    "outputPath": "partials/api/material.components.card/index.html",
    "url": "api/material.components.card",
    "label": "material.components.card",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdCard",
        "type": "directive",
        "outputPath": "partials/api/material.components.card/directive/mdCard.html",
        "url": "api/material.components.card/directive/mdCard",
        "label": "mdCard",
        "hasDemo": true,
        "module": "material.components.card",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/card/card.js"
      }
    ]
  },
  {
    "name": "material.components.checkbox",
    "type": "module",
    "outputPath": "partials/api/material.components.checkbox/index.html",
    "url": "api/material.components.checkbox",
    "label": "material.components.checkbox",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdCheckbox",
        "type": "directive",
        "outputPath": "partials/api/material.components.checkbox/directive/mdCheckbox.html",
        "url": "api/material.components.checkbox/directive/mdCheckbox",
        "label": "mdCheckbox",
        "hasDemo": true,
        "module": "material.components.checkbox",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/checkbox/checkbox.js"
      }
    ]
  },
  {
    "name": "material.components.content",
    "type": "module",
    "outputPath": "partials/api/material.components.content/index.html",
    "url": "api/material.components.content",
    "label": "material.components.content",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdContent",
        "type": "directive",
        "outputPath": "partials/api/material.components.content/directive/mdContent.html",
        "url": "api/material.components.content/directive/mdContent",
        "label": "mdContent",
        "hasDemo": true,
        "module": "material.components.content",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/content/content.js"
      }
    ]
  },
  {
    "name": "material.components.dialog",
    "type": "module",
    "outputPath": "partials/api/material.components.dialog/index.html",
    "url": "api/material.components.dialog",
    "label": "material.components.dialog",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "$mdDialog",
        "type": "service",
        "outputPath": "partials/api/material.components.dialog/service/$mdDialog.html",
        "url": "api/material.components.dialog/service/$mdDialog",
        "label": "$mdDialog",
        "hasDemo": false,
        "module": "material.components.dialog",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/dialog/dialog.js"
      }
    ]
  },
  {
    "name": "material.components.divider",
    "type": "module",
    "outputPath": "partials/api/material.components.divider/index.html",
    "url": "api/material.components.divider",
    "label": "material.components.divider",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdDivider",
        "type": "directive",
        "outputPath": "partials/api/material.components.divider/directive/mdDivider.html",
        "url": "api/material.components.divider/directive/mdDivider",
        "label": "mdDivider",
        "hasDemo": true,
        "module": "material.components.divider",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/divider/divider.js"
      }
    ]
  },
  {
    "name": "material.components.gridList",
    "type": "module",
    "outputPath": "partials/api/material.components.gridList/index.html",
    "url": "api/material.components.gridList",
    "label": "material.components.gridList",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdGridList",
        "type": "directive",
        "outputPath": "partials/api/material.components.gridList/directive/mdGridList.html",
        "url": "api/material.components.gridList/directive/mdGridList",
        "label": "mdGridList",
        "hasDemo": true,
        "module": "material.components.gridList",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/gridList.js"
      },
      {
        "name": "mdGridTile",
        "type": "directive",
        "outputPath": "partials/api/material.components.gridList/directive/mdGridTile.html",
        "url": "api/material.components.gridList/directive/mdGridTile",
        "label": "mdGridTile",
        "hasDemo": true,
        "module": "material.components.gridList",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/gridList.js"
      }
    ]
  },
  {
    "name": "material.components.icon",
    "type": "module",
    "outputPath": "partials/api/material.components.icon/index.html",
    "url": "api/material.components.icon",
    "label": "material.components.icon",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdIcon",
        "type": "directive",
        "outputPath": "partials/api/material.components.icon/directive/mdIcon.html",
        "url": "api/material.components.icon/directive/mdIcon",
        "label": "mdIcon",
        "hasDemo": true,
        "module": "material.components.icon",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/icon.js"
      },
      {
        "name": "$mdIconProvider",
        "type": "service",
        "outputPath": "partials/api/material.components.icon/service/$mdIconProvider.html",
        "url": "api/material.components.icon/service/$mdIconProvider",
        "label": "$mdIconProvider",
        "hasDemo": false,
        "module": "material.components.icon",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/icon.js"
      },
      {
        "name": "$mdIcon",
        "type": "service",
        "outputPath": "partials/api/material.components.icon/service/$mdIcon.html",
        "url": "api/material.components.icon/service/$mdIcon",
        "label": "$mdIcon",
        "hasDemo": false,
        "module": "material.components.icon",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/icon.js"
      }
    ]
  },
  {
    "name": "material.components.input",
    "type": "module",
    "outputPath": "partials/api/material.components.input/index.html",
    "url": "api/material.components.input",
    "label": "material.components.input",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdInputContainer",
        "type": "directive",
        "outputPath": "partials/api/material.components.input/directive/mdInputContainer.html",
        "url": "api/material.components.input/directive/mdInputContainer",
        "label": "mdInputContainer",
        "hasDemo": true,
        "module": "material.components.input",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js"
      },
      {
        "name": "mdInput",
        "type": "directive",
        "outputPath": "partials/api/material.components.input/directive/mdInput.html",
        "url": "api/material.components.input/directive/mdInput",
        "label": "mdInput",
        "hasDemo": true,
        "module": "material.components.input",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js"
      }
    ]
  },
  {
    "name": "material.components.list",
    "type": "module",
    "outputPath": "partials/api/material.components.list/index.html",
    "url": "api/material.components.list",
    "label": "material.components.list",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdList",
        "type": "directive",
        "outputPath": "partials/api/material.components.list/directive/mdList.html",
        "url": "api/material.components.list/directive/mdList",
        "label": "mdList",
        "hasDemo": true,
        "module": "material.components.list",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js"
      },
      {
        "name": "mdListItem",
        "type": "directive",
        "outputPath": "partials/api/material.components.list/directive/mdListItem.html",
        "url": "api/material.components.list/directive/mdListItem",
        "label": "mdListItem",
        "hasDemo": true,
        "module": "material.components.list",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js"
      }
    ]
  },
  {
    "name": "material.components.progressCircular",
    "type": "module",
    "outputPath": "partials/api/material.components.progressCircular/index.html",
    "url": "api/material.components.progressCircular",
    "label": "material.components.progressCircular",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdProgressCircular",
        "type": "directive",
        "outputPath": "partials/api/material.components.progressCircular/directive/mdProgressCircular.html",
        "url": "api/material.components.progressCircular/directive/mdProgressCircular",
        "label": "mdProgressCircular",
        "hasDemo": true,
        "module": "material.components.progressCircular",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressCircular/progressCircular.js"
      }
    ]
  },
  {
    "name": "material.components.sidenav",
    "type": "module",
    "outputPath": "partials/api/material.components.sidenav/index.html",
    "url": "api/material.components.sidenav",
    "label": "material.components.sidenav",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "$mdSidenav",
        "type": "service",
        "outputPath": "partials/api/material.components.sidenav/service/$mdSidenav.html",
        "url": "api/material.components.sidenav/service/$mdSidenav",
        "label": "$mdSidenav",
        "hasDemo": false,
        "module": "material.components.sidenav",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js"
      },
      {
        "name": "mdSidenavFocus",
        "type": "directive",
        "outputPath": "partials/api/material.components.sidenav/directive/mdSidenavFocus.html",
        "url": "api/material.components.sidenav/directive/mdSidenavFocus",
        "label": "mdSidenavFocus",
        "hasDemo": true,
        "module": "material.components.sidenav",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js"
      },
      {
        "name": "mdSidenav",
        "type": "directive",
        "outputPath": "partials/api/material.components.sidenav/directive/mdSidenav.html",
        "url": "api/material.components.sidenav/directive/mdSidenav",
        "label": "mdSidenav",
        "hasDemo": true,
        "module": "material.components.sidenav",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js"
      }
    ]
  },
  {
    "name": "material.components.slider",
    "type": "module",
    "outputPath": "partials/api/material.components.slider/index.html",
    "url": "api/material.components.slider",
    "label": "material.components.slider",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdSlider",
        "type": "directive",
        "outputPath": "partials/api/material.components.slider/directive/mdSlider.html",
        "url": "api/material.components.slider/directive/mdSlider",
        "label": "mdSlider",
        "hasDemo": true,
        "module": "material.components.slider",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/slider/slider.js"
      }
    ]
  },
  {
    "name": "material.components.subheader",
    "type": "module",
    "outputPath": "partials/api/material.components.subheader/index.html",
    "url": "api/material.components.subheader",
    "label": "material.components.subheader",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdSubheader",
        "type": "directive",
        "outputPath": "partials/api/material.components.subheader/directive/mdSubheader.html",
        "url": "api/material.components.subheader/directive/mdSubheader",
        "label": "mdSubheader",
        "hasDemo": true,
        "module": "material.components.subheader",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/subheader/subheader.js"
      }
    ]
  },
  {
    "name": "material.components.swipe",
    "type": "module",
    "outputPath": "partials/api/material.components.swipe/index.html",
    "url": "api/material.components.swipe",
    "label": "material.components.swipe",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdSwipeLeft",
        "type": "directive",
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeLeft.html",
        "url": "api/material.components.swipe/directive/mdSwipeLeft",
        "label": "mdSwipeLeft",
        "hasDemo": true,
        "module": "material.components.swipe",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js"
      },
      {
        "name": "mdSwipeRight",
        "type": "directive",
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeRight.html",
        "url": "api/material.components.swipe/directive/mdSwipeRight",
        "label": "mdSwipeRight",
        "hasDemo": true,
        "module": "material.components.swipe",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js"
      }
    ]
  },
  {
    "name": "material.components.progressLinear",
    "type": "module",
    "outputPath": "partials/api/material.components.progressLinear/index.html",
    "url": "api/material.components.progressLinear",
    "label": "material.components.progressLinear",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdProgressLinear",
        "type": "directive",
        "outputPath": "partials/api/material.components.progressLinear/directive/mdProgressLinear.html",
        "url": "api/material.components.progressLinear/directive/mdProgressLinear",
        "label": "mdProgressLinear",
        "hasDemo": true,
        "module": "material.components.progressLinear",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressLinear/progressLinear.js"
      }
    ]
  },
  {
    "name": "material.components.select",
    "type": "module",
    "outputPath": "partials/api/material.components.select/index.html",
    "url": "api/material.components.select",
    "label": "material.components.select",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdSelect",
        "type": "directive",
        "outputPath": "partials/api/material.components.select/directive/mdSelect.html",
        "url": "api/material.components.select/directive/mdSelect",
        "label": "mdSelect",
        "hasDemo": true,
        "module": "material.components.select",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/select/select.js"
      }
    ]
  },
  {
    "name": "material.components.radioButton",
    "type": "module",
    "outputPath": "partials/api/material.components.radioButton/index.html",
    "url": "api/material.components.radioButton",
    "label": "material.components.radioButton",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdRadioGroup",
        "type": "directive",
        "outputPath": "partials/api/material.components.radioButton/directive/mdRadioGroup.html",
        "url": "api/material.components.radioButton/directive/mdRadioGroup",
        "label": "mdRadioGroup",
        "hasDemo": true,
        "module": "material.components.radioButton",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radioButton.js"
      },
      {
        "name": "mdRadioButton",
        "type": "directive",
        "outputPath": "partials/api/material.components.radioButton/directive/mdRadioButton.html",
        "url": "api/material.components.radioButton/directive/mdRadioButton",
        "label": "mdRadioButton",
        "hasDemo": true,
        "module": "material.components.radioButton",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radioButton.js"
      }
    ]
  },
  {
    "name": "material.components.switch",
    "type": "module",
    "outputPath": "partials/api/material.components.switch/index.html",
    "url": "api/material.components.switch",
    "label": "material.components.switch",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdSwitch",
        "type": "directive",
        "outputPath": "partials/api/material.components.switch/directive/mdSwitch.html",
        "url": "api/material.components.switch/directive/mdSwitch",
        "label": "mdSwitch",
        "hasDemo": true,
        "module": "material.components.switch",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/switch/switch.js"
      }
    ]
  },
  {
    "name": "material.components.toast",
    "type": "module",
    "outputPath": "partials/api/material.components.toast/index.html",
    "url": "api/material.components.toast",
    "label": "material.components.toast",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "$mdToast",
        "type": "service",
        "outputPath": "partials/api/material.components.toast/service/$mdToast.html",
        "url": "api/material.components.toast/service/$mdToast",
        "label": "$mdToast",
        "hasDemo": false,
        "module": "material.components.toast",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/toast/toast.js"
      }
    ]
  },
  {
    "name": "material.components.toolbar",
    "type": "module",
    "outputPath": "partials/api/material.components.toolbar/index.html",
    "url": "api/material.components.toolbar",
    "label": "material.components.toolbar",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdToolbar",
        "type": "directive",
        "outputPath": "partials/api/material.components.toolbar/directive/mdToolbar.html",
        "url": "api/material.components.toolbar/directive/mdToolbar",
        "label": "mdToolbar",
        "hasDemo": true,
        "module": "material.components.toolbar",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/toolbar/toolbar.js"
      }
    ]
  },
  {
    "name": "material.components.tooltip",
    "type": "module",
    "outputPath": "partials/api/material.components.tooltip/index.html",
    "url": "api/material.components.tooltip",
    "label": "material.components.tooltip",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdTooltip",
        "type": "directive",
        "outputPath": "partials/api/material.components.tooltip/directive/mdTooltip.html",
        "url": "api/material.components.tooltip/directive/mdTooltip",
        "label": "mdTooltip",
        "hasDemo": true,
        "module": "material.components.tooltip",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tooltip/tooltip.js"
      }
    ]
  },
  {
    "name": "material.components.autocomplete",
    "type": "module",
    "outputPath": "partials/api/material.components.autocomplete/index.html",
    "url": "api/material.components.autocomplete",
    "label": "material.components.autocomplete",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdAutocomplete",
        "type": "directive",
        "outputPath": "partials/api/material.components.autocomplete/directive/mdAutocomplete.html",
        "url": "api/material.components.autocomplete/directive/mdAutocomplete",
        "label": "mdAutocomplete",
        "hasDemo": true,
        "module": "material.components.autocomplete",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/autocomplete.js"
      },
      {
        "name": "mdHighlightText",
        "type": "directive",
        "outputPath": "partials/api/material.components.autocomplete/directive/mdHighlightText.html",
        "url": "api/material.components.autocomplete/directive/mdHighlightText",
        "label": "mdHighlightText",
        "hasDemo": true,
        "module": "material.components.autocomplete",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/autocomplete.js"
      }
    ]
  },
  {
    "name": "material.components.chips",
    "type": "module",
    "outputPath": "partials/api/material.components.chips/index.html",
    "url": "api/material.components.chips",
    "label": "material.components.chips",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdChip",
        "type": "directive",
        "outputPath": "partials/api/material.components.chips/directive/mdChip.html",
        "url": "api/material.components.chips/directive/mdChip",
        "label": "mdChip",
        "hasDemo": true,
        "module": "material.components.chips",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/chips.js"
      },
      {
        "name": "mdChipRemove",
        "type": "directive",
        "outputPath": "partials/api/material.components.chips/directive/mdChipRemove.html",
        "url": "api/material.components.chips/directive/mdChipRemove",
        "label": "mdChipRemove",
        "hasDemo": true,
        "module": "material.components.chips",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/chips.js"
      },
      {
        "name": "mdChips",
        "type": "directive",
        "outputPath": "partials/api/material.components.chips/directive/mdChips.html",
        "url": "api/material.components.chips/directive/mdChips",
        "label": "mdChips",
        "hasDemo": true,
        "module": "material.components.chips",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/chips.js"
      },
      {
        "name": "mdContactChips",
        "type": "directive",
        "outputPath": "partials/api/material.components.chips/directive/mdContactChips.html",
        "url": "api/material.components.chips/directive/mdContactChips",
        "label": "mdContactChips",
        "hasDemo": true,
        "module": "material.components.chips",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/chips.js"
      }
    ]
  },
  {
    "name": "material.components.tabs",
    "type": "module",
    "outputPath": "partials/api/material.components.tabs/index.html",
    "url": "api/material.components.tabs",
    "label": "material.components.tabs",
    "hasDemo": false,
    "module": ".",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/./..js",
    "docs": [
      {
        "name": "mdTab",
        "type": "directive",
        "outputPath": "partials/api/material.components.tabs/directive/mdTab.html",
        "url": "api/material.components.tabs/directive/mdTab",
        "label": "mdTab",
        "hasDemo": true,
        "module": "material.components.tabs",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/tabs.js"
      },
      {
        "name": "mdTabs",
        "type": "directive",
        "outputPath": "partials/api/material.components.tabs/directive/mdTabs.html",
        "url": "api/material.components.tabs/directive/mdTabs",
        "label": "mdTabs",
        "hasDemo": true,
        "module": "material.components.tabs",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/tabs.js"
      }
    ]
  }
]);

DocsApp
.constant('PAGES', {
  "CSS": [
    {
      "name": "Typography",
      "outputPath": "partials/CSS/typography.html",
      "url": "/CSS/typography",
      "label": "Typography"
    }
  ],
  "Theming": [
    {
      "name": "Introduction and Terms",
      "outputPath": "partials/Theming/01_introduction.html",
      "url": "/Theming/01_introduction",
      "label": "Introduction and Terms"
    },
    {
      "name": "Declarative Syntax",
      "outputPath": "partials/Theming/02_declarative_syntax.html",
      "url": "/Theming/02_declarative_syntax",
      "label": "Declarative Syntax"
    },
    {
      "name": "Configuring a Theme",
      "outputPath": "partials/Theming/03_configuring_a_theme.html",
      "url": "/Theming/03_configuring_a_theme",
      "label": "Configuring a Theme"
    },
    {
      "name": "Multiple Themes",
      "outputPath": "partials/Theming/04_multiple_themes.html",
      "url": "/Theming/04_multiple_themes",
      "label": "Multiple Themes"
    }
  ]
});

angular.module('docsApp').constant('DEMOS', [
  {
    "name": "material.components.autocomplete",
    "label": "Autocomplete",
    "demos": [
      {
        "id": "autocompletedemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "autocompleteDemo",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "autocompletedemoFloatingLabel",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoFloatingLabel/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoFloatingLabel",
        "label": "Floating Label",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoFloatingLabel/index.html"
        },
        "ngModule": {
          "module": "autocompleteFloatingLabelDemo",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.autocomplete"
  },
  {
    "name": "material.components.bottomSheet",
    "label": "Bottom Sheet",
    "demos": [
      {
        "id": "bottomSheetdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "bottom-sheet-grid-template.html",
            "label": "bottom-sheet-grid-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/bottom-sheet-grid-template.html"
          },
          {
            "name": "bottom-sheet-list-template.html",
            "label": "bottom-sheet-list-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/bottom-sheet-list-template.html"
          },
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.bottomSheet",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/bottomSheet/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "bottomSheetDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.bottomSheet"
  },
  {
    "name": "material.components.button",
    "label": "Button",
    "demos": [
      {
        "id": "buttondemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/button/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/button/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.button",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/button/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "buttonsDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.button"
  },
  {
    "name": "material.components.card",
    "label": "Card",
    "demos": [
      {
        "id": "carddemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/card/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/card/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.card",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/card/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "cardDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.card"
  },
  {
    "name": "material.components.checkbox",
    "label": "Checkbox",
    "demos": [
      {
        "id": "checkboxdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "checkboxDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "checkboxdemoSyncing",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoSyncing/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoSyncing/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoSyncing",
        "label": "Syncing",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoSyncing/index.html"
        },
        "ngModule": {
          "module": "checkboxDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.checkbox"
  },
  {
    "name": "material.components.chips",
    "label": "Chips",
    "demos": [
      {
        "id": "chipsdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "chipsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "chipsdemoContactChips",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoContactChips/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoContactChips/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoContactChips",
        "label": "Contact Chips",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoContactChips/index.html"
        },
        "ngModule": {
          "module": "contactChipsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "chipsdemoCustomInputs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoCustomInputs/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoCustomInputs/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoCustomInputs",
        "label": "Custom Inputs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoCustomInputs/index.html"
        },
        "ngModule": {
          "module": "chipsCustomInputDemo",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "chipsdemoStaticChips",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoStaticChips/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoStaticChips/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoStaticChips",
        "label": "Static Chips",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoStaticChips/index.html"
        },
        "ngModule": {
          "module": "staticChipsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.chips"
  },
  {
    "name": "material.components.content",
    "label": "Content",
    "demos": [
      {
        "id": "contentdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/content/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.content",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/content/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "contentDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.content"
  },
  {
    "name": "material.components.dialog",
    "label": "Dialog",
    "demos": [
      {
        "id": "dialogdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/dialog/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "dialog1.tmpl.html",
            "label": "dialog1.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/dialog/demoBasicUsage/dialog1.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/dialog/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.dialog",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/dialog/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "dialogDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.dialog"
  },
  {
    "name": "material.components.divider",
    "label": "Divider",
    "demos": [
      {
        "id": "dividerdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/divider/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/divider/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.divider",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/divider/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "dividerDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.divider"
  },
  {
    "name": "material.components.gridList",
    "label": "Grid List",
    "demos": [
      {
        "id": "gridListdemoBasicUsage",
        "css": [
          {
            "name": "styles.css",
            "label": "styles.css",
            "fileType": "css",
            "outputPath": "demo-partials/gridList/demoBasicUsage/styles.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "gridListDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "gridListdemoDynamicTiles",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/gridList/demoDynamicTiles/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoDynamicTiles/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoDynamicTiles",
        "label": "Dynamic Tiles",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoDynamicTiles/index.html"
        },
        "ngModule": {
          "module": "gridListDemoApp",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "gridListdemoResponsiveUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoResponsiveUsage/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoResponsiveUsage",
        "label": "Responsive Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoResponsiveUsage/index.html"
        },
        "ngModule": {
          "module": "gridListDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.gridList"
  },
  {
    "name": "material.components.icon",
    "label": "Icon",
    "demos": [
      {
        "id": "icondemoFontIcons",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoFontIcons/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoFontIcons/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoFontIcons",
        "label": "Font Icons",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoFontIcons/index.html"
        },
        "ngModule": {
          "module": "appDemoFontIcons",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "icondemoLoadSvgIconsFromUrl",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoLoadSvgIconsFromUrl",
        "label": "Load Svg Icons From Url",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/index.html"
        },
        "ngModule": {
          "module": "appDemoSvgIcons",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "icondemoSvgIconSets",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoSvgIconSets/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoSvgIconSets/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoSvgIconSets",
        "label": "Svg Icon Sets",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoSvgIconSets/index.html"
        },
        "ngModule": {
          "module": "appSvgIconSets",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "icondemoUsingTemplateCache",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoUsingTemplateCache/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoUsingTemplateCache/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoUsingTemplateCache",
        "label": "Using Template Cache",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoUsingTemplateCache/index.html"
        },
        "ngModule": {
          "module": "appUsingTemplateCache",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.icon"
  },
  {
    "name": "material.components.input",
    "label": "Input",
    "demos": [
      {
        "id": "inputdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "inputBasicDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        }
      },
      {
        "id": "inputdemoErrors",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoErrors/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoErrors/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoErrors",
        "label": "Errors",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoErrors/index.html"
        },
        "ngModule": {
          "module": "inputErrorsApp",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        }
      },
      {
        "id": "inputdemoIcons",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoIcons/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoIcons/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoIcons",
        "label": "Icons",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoIcons/index.html"
        },
        "ngModule": {
          "module": "inputIconDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        }
      }
    ],
    "url": "/demo/material.components.input"
  },
  {
    "name": "material.components.list",
    "label": "List",
    "demos": [
      {
        "id": "listdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/list/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/list/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.list",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/list/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "listDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "listdemoListControls",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/list/demoListControls/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/list/demoListControls/script.js"
          }
        ],
        "moduleName": "material.components.list",
        "name": "demoListControls",
        "label": "List Controls",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/list/demoListControls/index.html"
        },
        "ngModule": {
          "module": "listDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.list"
  },
  {
    "name": "material.components.progressCircular",
    "label": "Progress Circular",
    "demos": [
      {
        "id": "progressCirculardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/progressCircular/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/progressCircular/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.progressCircular",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/progressCircular/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "progressCircularDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.progressCircular"
  },
  {
    "name": "material.components.progressLinear",
    "label": "Progress Linear",
    "demos": [
      {
        "id": "progressLineardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/progressLinear/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/progressLinear/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.progressLinear",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/progressLinear/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "progressLinearDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.progressLinear"
  },
  {
    "name": "material.components.radioButton",
    "label": "Radio Button",
    "demos": [
      {
        "id": "radioButtondemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/radioButton/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/radioButton/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.radioButton",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/radioButton/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "radioDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.radioButton"
  },
  {
    "name": "material.components.select",
    "label": "Select",
    "demos": [
      {
        "id": "selectdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "selectDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "selectdemoOptionGroups",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoOptionGroups/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoOptionGroups/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoOptionGroups",
        "label": "Option Groups",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoOptionGroups/index.html"
        },
        "ngModule": {
          "module": "selectDemoOptGroups",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "selectdemoOptionsWithAsyncSearch",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoOptionsWithAsyncSearch/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoOptionsWithAsyncSearch/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoOptionsWithAsyncSearch",
        "label": "Options With Async Search",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoOptionsWithAsyncSearch/index.html"
        },
        "ngModule": {
          "module": "selectDemoOptionsAsync",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "selectdemoValidations",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoValidations/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoValidations/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoValidations",
        "label": "Validations",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoValidations/index.html"
        },
        "ngModule": {
          "module": "selectDemoBasic",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        }
      }
    ],
    "url": "/demo/material.components.select"
  },
  {
    "name": "material.components.sidenav",
    "label": "Sidenav",
    "demos": [
      {
        "id": "sidenavdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/sidenav/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.sidenav",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/sidenav/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "sidenavDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.sidenav"
  },
  {
    "name": "material.components.slider",
    "label": "Slider",
    "demos": [
      {
        "id": "sliderdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/slider/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/slider/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.slider",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/slider/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "sliderDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.slider"
  },
  {
    "name": "material.components.subheader",
    "label": "Subheader",
    "demos": [
      {
        "id": "subheaderdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/subheader/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/subheader/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.subheader",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/subheader/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "subheaderBasicDemo",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.subheader"
  },
  {
    "name": "material.components.switch",
    "label": "Switch",
    "demos": [
      {
        "id": "switchdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/switch/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/switch/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.switch",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/switch/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "switchDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.switch"
  },
  {
    "name": "material.components.tabs",
    "label": "Tabs",
    "demos": [
      {
        "id": "tabsdemoDynamicHeight",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoDynamicHeight",
        "label": "Dynamic Height",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoDynamicHeight/index.html"
        },
        "ngModule": {
          "module": "tabsDemoDynamicHeight",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "tabsdemoDynamicTabs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoDynamicTabs",
        "label": "Dynamic Tabs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoDynamicTabs/index.html"
        },
        "ngModule": {
          "module": "tabsDemoDynamicTabs",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "tabsdemoStaticTabs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoStaticTabs/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoStaticTabs/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoStaticTabs/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoStaticTabs",
        "label": "Static Tabs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoStaticTabs/index.html"
        },
        "ngModule": {
          "module": "tabsDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.tabs"
  },
  {
    "name": "material.components.toast",
    "label": "Toast",
    "demos": [
      {
        "id": "toastdemoBasicUsage",
        "css": [],
        "html": [
          {
            "name": "toast-template.html",
            "label": "toast-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/toast/demoBasicUsage/toast-template.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toast/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.toast",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toast/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "toastDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.toast"
  },
  {
    "name": "material.components.toolbar",
    "label": "Toolbar",
    "demos": [
      {
        "id": "toolbardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toolbar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toolbar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.toolbar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toolbar/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "toolbarDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      },
      {
        "id": "toolbardemoScrollShrink",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toolbar/demoScrollShrink/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toolbar/demoScrollShrink/script.js"
          }
        ],
        "moduleName": "material.components.toolbar",
        "name": "demoScrollShrink",
        "label": "Scroll Shrink",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toolbar/demoScrollShrink/index.html"
        },
        "ngModule": {
          "module": "toolbarDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.toolbar"
  },
  {
    "name": "material.components.tooltip",
    "label": "Tooltip",
    "demos": [
      {
        "id": "tooltipdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tooltip/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tooltip/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.tooltip",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tooltip/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "tooltipDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.tooltip"
  },
  {
    "name": "material.components.whiteframe",
    "label": "Whiteframe",
    "demos": [
      {
        "id": "whiteframedemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/whiteframe/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/whiteframe/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.whiteframe",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/whiteframe/demoBasicUsage/index.html"
        },
        "ngModule": {
          "module": "whiteframeBasicUsage",
          "dependencies": [
            "ngMaterial"
          ]
        }
      }
    ],
    "url": "/demo/material.components.whiteframe"
  }
]);
DocsApp
.directive('layoutAlign', function() { return angular.noop; })
.directive('layout', function() { return angular.noop; })
.directive('docsDemo', [
  '$mdUtil',
function($mdUtil) {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'partials/docs-demo.tmpl.html',
    transclude: true,
    controller: ['$scope', '$element', '$attrs', '$interpolate', DocsDemoCtrl],
    controllerAs: 'demoCtrl',
    bindToController: true
  };

  function DocsDemoCtrl($scope, $element, $attrs, $interpolate) {
    var self = this;

    self.interpolateCode = angular.isDefined($attrs.interpolateCode);
    self.demoId = $interpolate($attrs.demoId || '')($scope.$parent);
    self.demoTitle = $interpolate($attrs.demoTitle || '')($scope.$parent);
    self.demoModule = $interpolate($attrs.demoModule || '')($scope.$parent);
    self.files = {
      css: [], js: [], html: []
    };

    self.addFile = function(name, contentsPromise) {
      var file = {
        name: convertName(name),
        contentsPromise: contentsPromise,
        fileType: name.split('.').pop()
      };
      contentsPromise.then(function(contents) {
        file.contents = contents;
      });

      if (name === 'index.html') {
        self.files.index = file;
      } else if (name === 'readme.html') {
       self.demoDescription = file;
      } else {
        self.files[file.fileType] = self.files[file.fileType] || [];
        self.files[file.fileType].push(file);
      }

      self.orderedFiles = []
        .concat(self.files.index || [])
        .concat(self.files.js || [])
        .concat(self.files.css || [])
        .concat(self.files.html || []);
    };

    function convertName(name) {
      switch(name) {
        case "index.html" : return "HTML";
        case "script.js" : return "JS";
        case "style.css" : return "CSS";
        default : return name;
      }
    }

  }
}])
.directive('demoFile', ['$q', '$interpolate', function($q, $interpolate) {
  return {
    restrict: 'E',
    require: '^docsDemo',
    compile: compile
  };

  function compile(element, attr) {
    var contentsAttr = attr.contents;
    var html = element.html();
    var name = attr.name;
    element.contents().remove();

    return function postLink(scope, element, attr, docsDemoCtrl) {
      docsDemoCtrl.addFile(
        $interpolate(name)(scope), 
        $q.when(scope.$eval(contentsAttr) || html)
      );
      element.remove();
    };
  }
}])

.filter('toHtml', ['$sce', function($sce) {
  return function(str) {
    return $sce.trustAsHtml(str);
  };
}]);

DocsApp.directive('demoInclude', [
  '$q', 
  '$http', 
  '$compile', 
  '$templateCache',
  '$timeout',
function($q, $http, $compile, $templateCache, $timeout) {
  return {
    restrict: 'E',
    link: postLink
  };
  
  function postLink(scope, element, attr) {
    var demoContainer;

    // Interpret the expression given as `demo-include files="something"`
    var files = scope.$eval(attr.files) || {};
    var ngModule = scope.$eval(attr.module) || '';

    $timeout(handleDemoIndexFile);

    /**
     * Fetch the index file, and if it contains its own ngModule
     * then bootstrap a new angular app with that ngModule. Otherwise, compile
     * the demo into the current ng-app.
     */
    function handleDemoIndexFile() {
      files.index.contentsPromise.then(function(contents) {
        demoContainer = angular.element(
          '<div class="demo-content ' + ngModule + '">'
        );

        var isStandalone = !!ngModule;
        var demoScope;
        var demoCompileService;
        if (isStandalone) {
          angular.bootstrap(demoContainer[0], [ngModule]);
          demoScope = demoContainer.scope();
          demoCompileService = demoContainer.injector().get('$compile');
          scope.$on('$destroy', function() {
            demoScope.$destroy();
          });

        } else {
          demoScope = scope.$new();
          demoCompileService = $compile;
        }

        // Once everything is loaded, put the demo into the DOM
        $q.all([
          handleDemoStyles(),
          handleDemoTemplates()
        ]).finally(function() {
          demoScope.$evalAsync(function() {
            element.append(demoContainer);
            demoContainer.html(contents);
            demoCompileService(demoContainer.contents())(demoScope);
          });
        });
      });

    }


    /**
     * Fetch the demo styles, and append them to the DOM.
     */
    function handleDemoStyles() {
      return $q.all(files.css.map(function(file) {
        return file.contentsPromise;
      }))
      .then(function(styles) {
        styles = styles.join('\n'); //join styles as one string

        var styleElement = angular.element('<style>' + styles + '</style>');
        document.body.appendChild(styleElement[0]);

        scope.$on('$destroy', function() {
          styleElement.remove();
        });
      });

    }

    /**
     * Fetch the templates for this demo, and put the templates into
     * the demo app's templateCache, with a url that allows the demo apps
     * to reference their templates local to the demo index file.
     *
     * For example, make it so the dialog demo can reference templateUrl
     * 'my-dialog.tmpl.html' instead of having to reference the url
     * 'generated/material.components.dialog/demo/demo1/my-dialog.tmpl.html'.
     */
    function handleDemoTemplates() {
      return $q.all(files.html.map(function(file) {

        return file.contentsPromise.then(function(contents) {
          // Get the $templateCache instance that goes with the demo's specific ng-app.
          var demoTemplateCache = demoContainer.injector().get('$templateCache');
          demoTemplateCache.put(file.name, contents);

          scope.$on('$destroy', function() {
            demoTemplateCache.remove(file.name);
          });

        });

      }));

    }

  }

}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/demo.tmpl.html',
    '<docs-demo ng-repeat="demo in demos" \n' +
    '  demo-id="{{demo.id}}" demo-title="{{demo.label}}" demo-module="{{demo.ngModule.module}}">\n' +
    '  <demo-file ng-repeat="file in demo.$files"\n' +
    '             name="{{file.name}}" contents="file.httpPromise">\n' +
    '  </demo-file>\n' +
    '</docs-demo>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/docs-demo.tmpl.html',
    '<div layout="column" class="doc-content">\n' +
    '  <div flex layout="column" style="z-index:1">\n' +
    '\n' +
    '    <div class="doc-description" ng-bind-html="demoCtrl.demoDescription.contents | toHtml"></div>\n' +
    '\n' +
    '    <div ng-transclude></div>\n' +
    '\n' +
    '    <section class="demo-container md-whiteframe-z1"\n' +
    '      ng-class="{\'show-source\': demoCtrl.$showSource}" >\n' +
    '\n' +
    '      <md-toolbar class="demo-toolbar">\n' +
    '        <div class="md-toolbar-tools">\n' +
    '          <h3>{{demoCtrl.demoTitle}}</h3>\n' +
    '          <span flex></span>\n' +
    '          <md-button\n' +
    '            style="min-width: 72px; margin-left: auto;"\n' +
    '            ng-click="demoCtrl.$showSource = !demoCtrl.$showSource">\n' +
    '            <div flex layout="row" layout-align="center center">\n' +
    '              <md-icon md-svg-src="img/icons/ic_visibility_24px.svg"\n' +
    '                 style="margin: 0 4px 0 0;">\n' +
    '              </md-icon>\n' +
    '              Source\n' +
    '            </div>\n' +
    '          </md-button>\n' +
    '        </div>\n' +
    '      </md-toolbar>\n' +
    '\n' +
    '      <!-- Source views -->\n' +
    '      <md-tabs class="demo-source-tabs" ng-show="demoCtrl.$showSource" style="min-height: 0;">\n' +
    '        <md-tab ng-repeat="file in demoCtrl.orderedFiles" label="{{file.name}}">\n' +
    '          <md-content md-scroll-y class="demo-source-container">\n' +
    '            <hljs class="no-header" code="file.contentsPromise" lang="{{file.fileType}}" should-interpolate="demoCtrl.interpolateCode">\n' +
    '            </hljs>\n' +
    '          </md-content>\n' +
    '        </md-tab>\n' +
    '      </md-tabs>\n' +
    '\n' +
    '      <!-- Live Demos -->\n' +
    '      <demo-include files="demoCtrl.files" module="demoCtrl.demoModule" class="{{demoCtrl.demoId}}">\n' +
    '      </demo-include>\n' +
    '    </section>\n' +
    '\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/getting-started.tmpl.html',
    '<div ng-controller="GuideCtrl" layout="column" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <p><em>New to Angular.js? Before getting into Angular Material, it might be helpful to\n' +
    '      <a href="https://egghead.io/articles/new-to-angularjs-start-learning-here" target="_blank"\n' +
    '         title="Link opens in a new window">read about the framework</a>.</em></p>\n' +
    '\n' +
    '    <h2>How do I start?</h2>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li><a href="http://codepen.io/collection/AxKKgY/" target="_blank"\n' +
    '             title="Link opens in a new window">Fork a Codepen</a></li>\n' +
    '      <li><a href="https://github.com/angular/material-start" target="_blank"\n' +
    '             title="Link opens in a new window">Clone a Github Starter Project</a></li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <h3>Including Angular Material and its dependencies</h3>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li><a href="https://github.com/angular/material#bower">Using Bower</a></li>\n' +
    '      <li><a href="https://github.com/angular/material#cdn">Using a CDN</a> (example below)</li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <iframe height=\'272\' scrolling=\'no\' data-default-tab="html"\n' +
    '            src=\'//codepen.io/marcysutton/embed/OPbpKm?height=272&theme-id=11083\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>\n' +
    '      See the Pen <a href=\'http://codepen.io/marcysutton/pen/OPbpKm/\'>Angular Material Dependencies</a>\n' +
    '      on <a href=\'http://codepen.io\'>CodePen</a>.\n' +
    '    </iframe>\n' +
    '\n' +
    '    <md-divider></md-divider>\n' +
    '\n' +
    '    <h2>Contributing to Angular Material</h2>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>To contribute, fork our GitHub <a href="https://github.com/angular/material">repository</a>.</li>\n' +
    '      <li>Please read our <a href="https://github.com/angular/material#contributing">contributor guidelines</a>.</li>\n' +
    '      <li>For problems,\n' +
    '          <a href="https://github.com/angular/material/issues?q=is%3Aissue+is%3Aopen" target="_blank">\n' +
    '              search the issues\n' +
    '          </a> and/or\n' +
    '          <a href="https://github.com/angular/material/issues/new" target="_blank">\n' +
    '              create a new issue\n' +
    '          </a>.\n' +
    '      </li>\n' +
    '      <li>For questions,\n' +
    '          <a href="https://groups.google.com/forum/#!forum/ngmaterial" target="_blank">\n' +
    '              search the forum\n' +
    '          </a> and/or post a new message.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '  </md-content>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/home.tmpl.html',
    '<div ng-controller="HomeCtrl" layout="column" class="doc-content">\n' +
    '    <md-content>\n' +
    '        <p>The <strong>Angular Material</strong> project is an implementation of Material Design in Angular.js. This project provides a set of reusable, well-tested, and accessible UI components based on the Material Design system.</p>\n' +
    '\n' +
    '        <p>Similar to the\n' +
    '            <a href="http://www.polymer-project.org/">Polymer</a> project\'s\n' +
    '            <a href="http://www.polymer-project.org/docs/elements/paper-elements.html">Paper elements</a> collection, Angular Material is supported internally at Google by the Angular.js, Material Design UX and other product teams.\n' +
    '        </p>\n' +
    '\n' +
    '        <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '          <li flex="25" flex-md="50" flex-sm="50">\n' +
    '            <md-card>\n' +
    '              <md-card-content>\n' +
    '                <a ng-href="#/getting-started">Getting Started</a>\n' +
    '              </md-card-content>\n' +
    '            </md-card>\n' +
    '          </li>\n' +
    '          <li flex="25" flex-md="50" flex-sm="50">\n' +
    '            <md-card>\n' +
    '              <md-card-content>\n' +
    '                <a ng-href="#/demo/">Demos</a>\n' +
    '              </md-card-content>\n' +
    '            </md-card>\n' +
    '          </li>\n' +
    '          <li flex="25" flex-md="50" flex-sm="50">\n' +
    '            <md-card>\n' +
    '              <md-card-content>\n' +
    '                <a ng-href="#/CSS/typography">Customization</a>\n' +
    '              </md-card-content>\n' +
    '            </md-card>\n' +
    '          </li>\n' +
    '          <li flex="25" flex-md="50" flex-sm="50">\n' +
    '            <md-card>\n' +
    '              <md-card-content>\n' +
    '                <a ng-href="#/api/">API Reference</a>\n' +
    '              </md-card-content>\n' +
    '            </md-card>\n' +
    '          </li>\n' +
    '        </ul>\n' +
    '\n' +
    '        <h2 class="md-title">What is Material Design?</h2>\n' +
    '        <p>\n' +
    '            <a href="http://www.google.com/design/spec/material-design/">Material Design</a> is a specification for a\n' +
    '            unified system of visual, motion, and interaction design that adapts across different devices and different\n' +
    '            screen sizes.\n' +
    '\n' +
    '            Below is a brief video that presents the Material Design system:\n' +
    '        </p>\n' +
    '\n' +
    '        <md-content>\n' +
    '          <div style="max-width: 560px; margin: 0 auto;">\n' +
    '            <div class="responsive-video">\n' +
    '              <iframe title="Material Design" src="//www.youtube.com/embed/Q8TXgCzxEnw" frameborder="0" allowfullscreen></iframe>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '        </md-content>\n' +
    '        <ul>\n' +
    '            <li>These docs were generated from source in the `master` branch:\n' +
    '                <ul style="padding-top:5px;">\n' +
    '                    <li>\n' +
    '                        at commit <a ng-href="{{BUILDCONFIG.repository}}/commit/{{BUILDCONFIG.commit}}" target="_blank">\n' +
    '                        v{{BUILDCONFIG.version}}  -  SHA {{BUILDCONFIG.commit.substring(0,7)}}\n' +
    '                    </a>.\n' +
    '                    </li>\n' +
    '                    <li>\n' +
    '                        on {{BUILDCONFIG.date}} GMT.\n' +
    '                    </li>\n' +
    '                </ul>\n' +
    '\n' +
    '            </li>\n' +
    '        </ul>\n' +
    '        <br/>\n' +
    '        <br/>\n' +
    '    </md-content>\n' +
    '</div>\n' +
    '\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-alignment.tmpl.html',
    '<div ng-controller="LayoutCtrl" layout="column" layout-fill class="layout-content">\n' +
    '\n' +
    '  <p>\n' +
    '    The <code>layout-align</code> attribute takes two words.\n' +
    '    The first word says how the children will be aligned in the layout\'s direction, and the second word says how the children will be aligned perpendicular to the layout\'s direction.</p>\n' +
    '\n' +
    '    <p>Only one word is required for the attribute. For example, <code>layout="row" layout-align="center"</code> would make the elements center horizontally and use the default behavior vertically.</p>\n' +
    '\n' +
    '    <p><code>layout="column" layout-align="center end"</code> would make\n' +
    '    children align along the center vertically and along the end (right) horizontally.</p>\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td>layout-align</td>\n' +
    '      <td>Sets child alignment.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align-sm</td>\n' +
    '      <td>Sets child alignment on devices less than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align-gt-sm</td>\n' +
    '      <td>Sets child alignment on devices greater than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align-md</td>\n' +
    '      <td>Sets child alignment on devices between 600px and 960px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align-gt-md</td>\n' +
    '      <td>Sets child alignment on devices greater than 960px wide.\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align-lg</td>\n' +
    '      <td>Sets child alignment on devices between 960px and 1200px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align-gt-lg</td>\n' +
    '      <td>Sets child alignment on devices greater than 1200px wide.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <p>\n' +
    '   See below for more examples:\n' +
    '  </p>\n' +
    '\n' +
    '  <section class="layout-panel-parent">\n' +
    '    <div ng-panel="layoutDemo">\n' +
    '      <docs-demo demo-title=\'layout="{{layoutDemo.direction}}" layout-align="{{layoutAlign()}}"\' class="small-demo" interpolate-code="true">\n' +
    '        <demo-file name="index.html">\n' +
    '          <div layout="{{layoutDemo.direction}}" layout-align="{{layoutAlign()}}">\n' +
    '            <div>one</div>\n' +
    '            <div>two</div>\n' +
    '            <div>three</div>\n' +
    '          </div>\n' +
    '        </demo-file>\n' +
    '      </docs-demo>\n' +
    '    </div>\n' +
    '  </section>\n' +
    '\n' +
    '  <div layout="column" layout-gt-sm="row" layout-align="space-around">\n' +
    '\n' +
    '    <div>\n' +
    '      <md-subheader>Layout Direction</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.direction">\n' +
    '        <md-radio-button value="row">row</md-radio-button>\n' +
    '        <md-radio-button value="column">column</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '    <div>\n' +
    '      <md-subheader>Alignment in Layout Direction ({{layoutDemo.direction == \'row\' ? \'horizontal\' : \'vertical\'}})</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.mainAxis">\n' +
    '        <md-radio-button value="start">start</md-radio-button>\n' +
    '        <md-radio-button value="center">center</md-radio-button>\n' +
    '        <md-radio-button value="end">end</md-radio-button>\n' +
    '        <md-radio-button value="space-around">space-around</md-radio-button>\n' +
    '        <md-radio-button value="space-between">space-between</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '    <div>\n' +
    '      <md-subheader>Alignment in Perpendicular Direction ({{layoutDemo.direction == \'column\' ? \'horizontal\' : \'vertical\'}})</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.crossAxis">\n' +
    '        <md-radio-button value="start">start</md-radio-button>\n' +
    '        <md-radio-button value="center">center</md-radio-button>\n' +
    '        <md-radio-button value="end">end</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-container.tmpl.html',
    '<div ng-controller="LayoutCtrl" layout="column" layout-fill class="layout-content">\n' +
    '\n' +
    '  <h3>Overview</h3>\n' +
    '  <p>\n' +
    '    Angular Material\'s responsive CSS layout is built on\n' +
    '    <a href="http://www.w3.org/TR/css3-flexbox/">flexbox</a>.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    The layout system is based upon element attributes rather than CSS classes.\n' +
    '    Attributes provide an easy way to set a value (eg <code>layout="row"</code>), and additionally\n' +
    '    helps us separate concerns: attributes define layout, and classes define styling.\n' +
    '  </p>\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '  <h3>Layout Attribute</h3>\n' +
    '  <p>\n' +
    '    Use the <code>layout</code> attribute on an element to arrange its children\n' +
    '    horizontally in a row (<code>layout="row"</code>), or vertically in\n' +
    '    a column (<code>layout="column"</code>). \n' +
    '  </p>\n' +
    '\n' +
    '  <hljs lang="html">\n' +
    '    <div layout="row">\n' +
    '      <div>I\'m left.</div>\n' +
    '      <div>I\'m right.</div>\n' +
    '    </div>\n' +
    '    <div layout="column">\n' +
    '      <div>I\'m above.</div>\n' +
    '      <div>I\'m below.</div>\n' +
    '    </div>\n' +
    '  </hljs>\n' +
    '\n' +
    '  <p>\n' +
    '    See <a href="#/layout/options">Layout Options</a> for information on responsive layouts and other options.\n' +
    '  </p>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-grid.tmpl.html',
    '<div ng-controller="LayoutCtrl" layout="column" layout-fill class="layout-content">\n' +
    '\n' +
    '  <p>\n' +
    '    To customize the size and position of elements in a layout, use the\n' +
    '    <code>flex</code>, <code>offset</code>, and <code>flex-order</code> attributes.\n' +
    '  </p>\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex Attribute" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '        <div flex hide-sm>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <p>\n' +
    '    Add the <code>flex</code> attribute to a layout\'s child element, and it\n' +
    '    will flex (stretch) to fill the available area.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex Percent Values" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="33">\n' +
    '          [flex="33"]\n' +
    '        </div>\n' +
    '        <div flex="55">\n' +
    '          [flex="55"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '        <div flex="66">\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '        <div flex="33">\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <p>\n' +
    '    A layout child\'s <code>flex</code> attribute can be given an integer value from 0-100.\n' +
    '    The element will stretch to the percentage of available space matching the value.\n' +
    '    <br/><br/>\n' +
    '    The <code>flex</code> attribute value is restricted to 33, 66, and multiples\n' +
    '    of five.\n' +
    '    <br/>\n' +
    '    For example: <code>flex="5", flex="20", "flex="33", flex="50", flex="66", flex="75", ...</code>.\n' +
    '  </p>\n' +
    '  <p>\n' +
    '  See the <a href="#/layout/options">layout options page</a> for more information on responsive flex attributes.\n' +
    '  </p>\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '  <docs-demo demo-title="Flex Order Attribute" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-margin>\n' +
    '        <div flex flex-order="3">\n' +
    '          [flex-order="3"]\n' +
    '        </div>\n' +
    '        <div flex flex-order="2">\n' +
    '          [flex-order="2"]\n' +
    '        </div>\n' +
    '        <div flex flex-order="1">\n' +
    '          [flex-order="1"]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <p>\n' +
    '    Add the <code>flex-order</code> attribute to a layout child to set its\n' +
    '    position within the layout. Any value from 0-9 is accepted.\n' +
    '  </p>\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td>flex-order</td>\n' +
    '      <td>Sets element order.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order-sm</td>\n' +
    '      <td>Sets element order on devices less than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order-gt-sm</td>\n' +
    '      <td>Sets element order on devices greater than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order-md</td>\n' +
    '      <td>Sets element order on devices between 600px and 960px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order-gt-md</td>\n' +
    '      <td>Sets element order on devices greater than 960px wide.\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order-lg</td>\n' +
    '      <td>Sets element order on devices between 960px and 1200px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order-gt-lg</td>\n' +
    '      <td>Sets element order on devices greater than 1200px wide.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <md-divider></md-divider>\n' +
    '  <docs-demo demo-title="Flex Offset Attribute" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex offset="33">\n' +
    '          [flex offset="33"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <p>\n' +
    '    Add the <code>offset</code> attribute to a layout child to set its\n' +
    '    offset percentage within the layout. Values must be multiples \n' +
    '    of <code>5</code>, or <code>33</code>, <code>34</code>, <code>66</code>, <code>67</code>.\n' +
    '  </p>\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td>offset</td>\n' +
    '      <td>Sets element offset.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>offset-sm</td>\n' +
    '      <td>Sets element offset on devices less than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>offset-gt-sm</td>\n' +
    '      <td>Sets element offset on devices greater than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>offset-md</td>\n' +
    '      <td>Sets element offset on devices between 600px and 960px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>offset-gt-md</td>\n' +
    '      <td>Sets element offset on devices greater than 960px wide.\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>offset-lg</td>\n' +
    '      <td>Sets element offset on devices between 960px and 1200px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>offset-gt-lg</td>\n' +
    '      <td>Sets element offset on devices greater than 1200px wide.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '</div>\n' +
    '\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-options.tmpl.html',
    '<div ng-controller="LayoutCtrl" layout="column" layout-fill class="layout-content layout-options">\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Layout" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-sm="column">\n' +
    '        <div flex>\n' +
    '          I\'m above on mobile, and to the left on larger devices.\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          I\'m below on mobile, and to the right on larger devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="#/layout/container">Layout Container</a> page for a basic explanation\n' +
    '    of layout attributes.\n' +
    '    <br/>\n' +
    '    To make your layout change depending upon the device size, there are\n' +
    '    other <code>layout</code> attributes available:\n' +
    '  </p>\n' +
    '\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td>layout</td>\n' +
    '      <td>Sets the default layout on all devices.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-sm</td>\n' +
    '      <td>Sets the layout on devices less than 600px wide (phones).</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-sm</td>\n' +
    '      <td>Sets the layout on devices greater than 600px wide (bigger than phones).</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-md</td>\n' +
    '      <td>Sets the layout on devices between 600px and 960px wide (tablets in portrait).</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-md</td>\n' +
    '      <td>Sets the layout on devices greater than 960px wide (bigger than tablets in portrait).</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-lg</td>\n' +
    '      <td>Sets the layout on devices between 960 and 1200px wide (tablets in landscape).</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-lg</td>\n' +
    '      <td>Sets the layout on devices greater than 1200px wide (computers and large screens).</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <br/>\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '\n' +
    '  <docs-demo demo-title="Layout Margin, Padding and Fill" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-margin layout-fill layout-padding>\n' +
    '        <div flex>I\'m on the left, and there\'s an empty area around me.</div>\n' +
    '        <div flex>I\'m on the right, and there\'s an empty area around me.</div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    <code>layout-margin</code> adds margin around each <code>flex</code> child. It also adds a margin to the layout container itself.\n' +
    '    <br/>\n' +
    '    <code>layout-padding</code> adds padding inside each <code>flex</code> child. It also adds padding to the layout container itself.\n' +
    '    <br/>\n' +
    '    <code>layout-fill</code> forces the layout element to fill its parent container.\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '\n' +
    '  <docs-demo demo-title="Wrap" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="66">[flex=66]</div>\n' +
    '        <div flex="66">[flex=66]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <p>\n' +
    '    <code>layout-wrap</code> allows <code>flex</code> children to wrap within the container if the elements use more than 100%.\n' +
    '    <br/>\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Flex & Offset Attributes" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex="66" flex-sm="33">\n' +
    '          I flex to one-third of the space on mobile, and two-thirds on other devices.\n' +
    '        </div>\n' +
    '        <div flex="33" flex-sm="66">\n' +
    '          I flex to two-thirds of the space on mobile, and one-third on other devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="#/layout/grid">Layout Grid</a> page for a basic explanation\n' +
    '    of flex and offset attributes.\n' +
    '  </p>\n' +
    '\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td>flex</td>\n' +
    '      <td>Sets flex.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-sm</td>\n' +
    '      <td>Sets flex on devices less than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-gt-sm</td>\n' +
    '      <td>Sets flex on devices greater than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-md</td>\n' +
    '      <td>Sets flex on devices between 600px and 960px wide..</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-gt-md</td>\n' +
    '      <td>Sets flex on devices greater than 960px wide.\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-lg</td>\n' +
    '      <td>Sets flex on devices between 960px and 1200px.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-gt-lg</td>\n' +
    '      <td>Sets flex on devices greater than 1200px wide.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '  <md-divider></md-divider>\n' +
    '\n' +
    '  <docs-demo demo-title="Hide and Show Attributes" class="small-demo">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout layout-align="center center">\n' +
    '        <md-subheader hide-sm>\n' +
    '          I\'m hidden on mobile and shown on larger devices.\n' +
    '        </md-subheader>\n' +
    '        <md-subheader hide-gt-sm>\n' +
    '          I\'m shown on mobile and hidden on larger devices.\n' +
    '        </md-subheader>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <br/>\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td>hide</td>\n' +
    '      <td><code>display: none</code></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-sm</td>\n' +
    '      <td><code>display: none</code> on devices less than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-sm</td>\n' +
    '      <td><code>display: none</code> on devices greater than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-md</td>\n' +
    '      <td><code>display: none</code> on devices between 600px and 960px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-md</td>\n' +
    '      <td><code>display: none</code> on devices greater than 960px wide.\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-lg</td>\n' +
    '      <td><code>display: none</code> on devices between 960px and 1200px.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-lg</td>\n' +
    '      <td><code>display: none</code> on devices greater than 1200px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show</td>\n' +
    '      <td>Negates hide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show-sm</td>\n' +
    '      <td>Negates hide on devices less than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show-gt-sm</td>\n' +
    '      <td>Negates hide on devices greater than 600px wide.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show-md</td>\n' +
    '      <td>Negates hide on devices between 600px and 960px wide..</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show-gt-md</td>\n' +
    '      <td>Negates hide on devices greater than 960px wide.\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show-lg</td>\n' +
    '      <td>Negates hide on devices between 960px and 1200px.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show-gt-lg</td>\n' +
    '      <td>Negates hide on devices greater than 1200px wide.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/menu-link.tmpl.html',
    '<md-button ng-class="{\'active\' : isSelected()}"\n' +
    '  ng-href="#{{section.url}}" ng-click="focusSection()">\n' +
    '  {{section | humanizeDoc}}\n' +
    '  <span class="md-visually-hidden"\n' +
    '    ng-if="isSelected()">\n' +
    '    current page\n' +
    '  </span>\n' +
    '</md-button>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/menu-toggle.tmpl.html',
    '<md-button class="md-button-toggle"\n' +
    '  ng-click="toggle()"\n' +
    '  aria-controls="docs-menu-{{section.name | nospace}}"\n' +
    '  aria-expanded="{{isOpen()}}">\n' +
    '  <div flex layout="row">\n' +
    '    {{section.name}}\n' +
    '    <span flex=""></span>\n' +
    '    <span aria-hidden="true" class="md-toggle-icon"\n' +
    '    ng-class="{\'toggled\' : isOpen()}">\n' +
    '      <md-icon md-svg-src="toggle-arrow"></md-icon>\n' +
    '    </span>\n' +
    '  </div>\n' +
    '  <span class="md-visually-hidden">\n' +
    '    Toggle {{isOpen()? \'expanded\' : \'collapsed\'}}\n' +
    '  </span>\n' +
    '</md-button>\n' +
    '\n' +
    '<ul ng-show="isOpen()" id="docs-menu-{{section.name | nospace}}" class="menu-toggle-list">\n' +
    '  <li ng-repeat="page in section.pages">\n' +
    '    <menu-link section="page"></menu-link>\n' +
    '  </li>\n' +
    '</ul>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/view-source.tmpl.html',
    '<md-dialog class="view-source-dialog">\n' +
    '\n' +
    '  <md-tabs>\n' +
    '    <md-tab ng-repeat="file in files"\n' +
    '                  active="file === data.selectedFile"\n' +
    '                  ng-click="data.selectedFile = file" >\n' +
    '        <span class="window_label">{{file.viewType}}</span>\n' +
    '    </md-tab>\n' +
    '  </md-tabs>\n' +
    '\n' +
    '  <md-dialog-content md-scroll-y flex>\n' +
    '    <div ng-repeat="file in files">\n' +
    '      <hljs code="file.content"\n' +
    '        lang="{{file.fileType}}"\n' +
    '        ng-show="file === data.selectedFile" >\n' +
    '      </hljs>\n' +
    '    </div>\n' +
    '  </md-dialog-content>\n' +
    '\n' +
    '  <div class="md-actions" layout="horizontal">\n' +
    '    <md-button class="md-primary" ng-click="$hideDialog()">\n' +
    '      Done\n' +
    '    </md-button>\n' +
    '  </div>\n' +
    '</md-dialog>\n' +
    '');
}]);

DocsApp

.directive('hljs', ['$timeout', '$q', '$interpolate', function($timeout, $q, $interpolate) {
  return {
    restrict: 'E',
    compile: function(element, attr) {
      var code;
      //No attribute? code is the content
      if (!attr.code) {
        code = element.html();
        element.empty();
      }

      return function(scope, element, attr) {

        if (attr.code) {
          // Attribute? code is the evaluation
          code = scope.$eval(attr.code);
        }
        var shouldInterpolate = scope.$eval(attr.shouldInterpolate);

        $q.when(code).then(function(code) {
          if (code) {
            if (shouldInterpolate) {
              code = $interpolate(code)(scope);
            }
            var contentParent = angular.element(
              '<pre><code class="highlight" ng-non-bindable></code></pre>'
            );
            element.append(contentParent);
            // Defer highlighting 1-frame to prevent GA interference...
            $timeout(function() {
              render(code, contentParent);
            }, 34, false);
          }
        });

        function render(contents, parent) {

          var codeElement = parent.find('code');
          var lines = contents.split('\n');

          // Remove empty lines
          lines = lines.filter(function(line) {
            return line.trim().length;
          });

          // Make it so each line starts at 0 whitespace
          var firstLineWhitespace = lines[0].match(/^\s*/)[0];
          var startingWhitespaceRegex = new RegExp('^' + firstLineWhitespace);
          lines = lines.map(function(line) {
            return line
              .replace(startingWhitespaceRegex, '')
              .replace(/\s+$/, '');
          });

          var highlightedCode = hljs.highlight(attr.language || attr.lang, lines.join('\n'), true);
          highlightedCode.value = highlightedCode.value
            .replace(/=<span class="hljs-value">""<\/span>/gi, '')
            .replace('<head>', '')
            .replace('<head/>', '');
          codeElement.append(highlightedCode.value).addClass('highlight');
        }
      };
    }
  };
}])
;

var hljs=new function(){function j(v){return v.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(v){return v.nodeName.toLowerCase()}function h(w,x){var v=w&&w.exec(x);return v&&v.index==0}function r(w){var v=(w.className+" "+(w.parentNode?w.parentNode.className:"")).split(/\s+/);v=v.map(function(x){return x.replace(/^lang(uage)?-/,"")});return v.filter(function(x){return i(x)||x=="no-highlight"})[0]}function o(x,y){var v={};for(var w in x){v[w]=x[w]}if(y){for(var w in y){v[w]=y[w]}}return v}function u(x){var v=[];(function w(y,z){for(var A=y.firstChild;A;A=A.nextSibling){if(A.nodeType==3){z+=A.nodeValue.length}else{if(t(A)=="br"){z+=1}else{if(A.nodeType==1){v.push({event:"start",offset:z,node:A});z=w(A,z);v.push({event:"stop",offset:z,node:A})}}}}return z})(x,0);return v}function q(w,y,C){var x=0;var F="";var z=[];function B(){if(!w.length||!y.length){return w.length?w:y}if(w[0].offset!=y[0].offset){return(w[0].offset<y[0].offset)?w:y}return y[0].event=="start"?w:y}function A(H){function G(I){return" "+I.nodeName+'="'+j(I.value)+'"'}F+="<"+t(H)+Array.prototype.map.call(H.attributes,G).join("")+">"}function E(G){F+="</"+t(G)+">"}function v(G){(G.event=="start"?A:E)(G.node)}while(w.length||y.length){var D=B();F+=j(C.substr(x,D[0].offset-x));x=D[0].offset;if(D==w){z.reverse().forEach(E);do{v(D.splice(0,1)[0]);D=B()}while(D==w&&D.length&&D[0].offset==x);z.reverse().forEach(A)}else{if(D[0].event=="start"){z.push(D[0].node)}else{z.pop()}v(D.splice(0,1)[0])}}return F+j(C.substr(x))}function m(y){function v(z){return(z&&z.source)||z}function w(A,z){return RegExp(v(A),"m"+(y.cI?"i":"")+(z?"g":""))}function x(D,C){if(D.compiled){return}D.compiled=true;D.k=D.k||D.bK;if(D.k){var z={};var E=function(G,F){if(y.cI){F=F.toLowerCase()}F.split(" ").forEach(function(H){var I=H.split("|");z[I[0]]=[G,I[1]?Number(I[1]):1]})};if(typeof D.k=="string"){E("keyword",D.k)}else{Object.keys(D.k).forEach(function(F){E(F,D.k[F])})}D.k=z}D.lR=w(D.l||/\b[A-Za-z0-9_]+\b/,true);if(C){if(D.bK){D.b="\\b("+D.bK.split(" ").join("|")+")\\b"}if(!D.b){D.b=/\B|\b/}D.bR=w(D.b);if(!D.e&&!D.eW){D.e=/\B|\b/}if(D.e){D.eR=w(D.e)}D.tE=v(D.e)||"";if(D.eW&&C.tE){D.tE+=(D.e?"|":"")+C.tE}}if(D.i){D.iR=w(D.i)}if(D.r===undefined){D.r=1}if(!D.c){D.c=[]}var B=[];D.c.forEach(function(F){if(F.v){F.v.forEach(function(G){B.push(o(F,G))})}else{B.push(F=="self"?D:F)}});D.c=B;D.c.forEach(function(F){x(F,D)});if(D.starts){x(D.starts,C)}var A=D.c.map(function(F){return F.bK?"\\.?("+F.b+")\\.?":F.b}).concat([D.tE,D.i]).map(v).filter(Boolean);D.t=A.length?w(A.join("|"),true):{exec:function(F){return null}};D.continuation={}}x(y)}function c(S,L,J,R){function v(U,V){for(var T=0;T<V.c.length;T++){if(h(V.c[T].bR,U)){return V.c[T]}}}function z(U,T){if(h(U.eR,T)){return U}if(U.eW){return z(U.parent,T)}}function A(T,U){return !J&&h(U.iR,T)}function E(V,T){var U=M.cI?T[0].toLowerCase():T[0];return V.k.hasOwnProperty(U)&&V.k[U]}function w(Z,X,W,V){var T=V?"":b.classPrefix,U='<span class="'+T,Y=W?"":"</span>";U+=Z+'">';return U+X+Y}function N(){if(!I.k){return j(C)}var T="";var W=0;I.lR.lastIndex=0;var U=I.lR.exec(C);while(U){T+=j(C.substr(W,U.index-W));var V=E(I,U);if(V){H+=V[1];T+=w(V[0],j(U[0]))}else{T+=j(U[0])}W=I.lR.lastIndex;U=I.lR.exec(C)}return T+j(C.substr(W))}function F(){if(I.sL&&!f[I.sL]){return j(C)}var T=I.sL?c(I.sL,C,true,I.continuation.top):e(C);if(I.r>0){H+=T.r}if(I.subLanguageMode=="continuous"){I.continuation.top=T.top}return w(T.language,T.value,false,true)}function Q(){return I.sL!==undefined?F():N()}function P(V,U){var T=V.cN?w(V.cN,"",true):"";if(V.rB){D+=T;C=""}else{if(V.eB){D+=j(U)+T;C=""}else{D+=T;C=U}}I=Object.create(V,{parent:{value:I}})}function G(T,X){C+=T;if(X===undefined){D+=Q();return 0}var V=v(X,I);if(V){D+=Q();P(V,X);return V.rB?0:X.length}var W=z(I,X);if(W){var U=I;if(!(U.rE||U.eE)){C+=X}D+=Q();do{if(I.cN){D+="</span>"}H+=I.r;I=I.parent}while(I!=W.parent);if(U.eE){D+=j(X)}C="";if(W.starts){P(W.starts,"")}return U.rE?0:X.length}if(A(X,I)){throw new Error('Illegal lexeme "'+X+'" for mode "'+(I.cN||"<unnamed>")+'"')}C+=X;return X.length||1}var M=i(S);if(!M){throw new Error('Unknown language: "'+S+'"')}m(M);var I=R||M;var D="";for(var K=I;K!=M;K=K.parent){if(K.cN){D+=w(K.cN,D,true)}}var C="";var H=0;try{var B,y,x=0;while(true){I.t.lastIndex=x;B=I.t.exec(L);if(!B){break}y=G(L.substr(x,B.index-x),B[0]);x=B.index+y}G(L.substr(x));for(var K=I;K.parent;K=K.parent){if(K.cN){D+="</span>"}}return{r:H,value:D,language:S,top:I}}catch(O){if(O.message.indexOf("Illegal")!=-1){return{r:0,value:j(L)}}else{throw O}}}function e(y,x){x=x||b.languages||Object.keys(f);var v={r:0,value:j(y)};var w=v;x.forEach(function(z){if(!i(z)){return}var A=c(z,y,false);A.language=z;if(A.r>w.r){w=A}if(A.r>v.r){w=v;v=A}});if(w.language){v.second_best=w}return v}function g(v){if(b.tabReplace){v=v.replace(/^((<[^>]+>|\t)+)/gm,function(w,z,y,x){return z.replace(/\t/g,b.tabReplace)})}if(b.useBR){v=v.replace(/\n/g,"<br>")}return v}function p(z){var y=b.useBR?z.innerHTML.replace(/\n/g,"").replace(/<br>|<br [^>]*>/g,"\n").replace(/<[^>]*>/g,""):z.textContent;var A=r(z);if(A=="no-highlight"){return}var v=A?c(A,y,true):e(y);var w=u(z);if(w.length){var x=document.createElementNS("http://www.w3.org/1999/xhtml","pre");x.innerHTML=v.value;v.value=q(w,u(x),y)}v.value=g(v.value);z.innerHTML=v.value;z.className+=" hljs "+(!A&&v.language||"");z.result={language:v.language,re:v.r};if(v.second_best){z.second_best={language:v.second_best.language,re:v.second_best.r}}}var b={classPrefix:"hljs-",tabReplace:null,useBR:false,languages:undefined};function s(v){b=o(b,v)}function l(){if(l.called){return}l.called=true;var v=document.querySelectorAll("pre code");Array.prototype.forEach.call(v,p)}function a(){addEventListener("DOMContentLoaded",l,false);addEventListener("load",l,false)}var f={};var n={};function d(v,x){var w=f[v]=x(this);if(w.aliases){w.aliases.forEach(function(y){n[y]=v})}}function k(){return Object.keys(f)}function i(v){return f[v]||f[n[v]]}this.highlight=c;this.highlightAuto=e;this.fixMarkup=g;this.highlightBlock=p;this.configure=s;this.initHighlighting=l;this.initHighlightingOnLoad=a;this.registerLanguage=d;this.listLanguages=k;this.getLanguage=i;this.inherit=o;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/};this.CLCM={cN:"comment",b:"//",e:"$",c:[this.PWM]};this.CBCM={cN:"comment",b:"/\\*",e:"\\*/",c:[this.PWM]};this.HCM={cN:"comment",b:"#",e:"$",c:[this.PWM]};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM={cN:"number",b:this.BNR,r:0};this.CSSNM={cN:"number",b:this.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0};this.RM={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}}();hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"},c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBCM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBCM,a.RM,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:true,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});hljs.registerLanguage("css",function(a){var b="[a-zA-Z-][a-zA-Z0-9_-]*";var c={cN:"function",b:b+"\\(",rB:true,eE:true,e:"\\("};return{cI:true,i:"[=/|']",c:[a.CBCM,{cN:"id",b:"\\#[A-Za-z0-9_-]+"},{cN:"class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"attr_selector",b:"\\[",e:"\\]",i:"$"},{cN:"pseudo",b:":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:true,eE:true,r:0,c:[c,a.ASM,a.QSM,a.CSSNM]}]},{cN:"tag",b:b,r:0},{cN:"rules",b:"{",e:"}",i:"[^\\s]",r:0,c:[a.CBCM,{cN:"rule",b:"[^\\s]",rB:true,e:";",eW:true,c:[{cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:true,i:"[^\\s]",starts:{cN:"value",eW:true,eE:true,c:[c,a.CSSNM,a.QSM,a.ASM,a.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]}]}]}});hljs.registerLanguage("xml",function(a){var c="[A-Za-z0-9\\._:-]+";var d={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"};var b={eW:true,i:/</,r:0,c:[d,{cN:"attribute",b:c,r:0},{b:"=",r:0,c:[{cN:"value",v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:true,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},{cN:"comment",b:"<!--",e:"-->",r:10},{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[b],starts:{e:"</style>",rE:true,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[b],starts:{e:"<\/script>",rE:true,sL:"javascript"}},{b:"<%",e:"%>",sL:"vbscript"},d,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:"[^ /><]+",r:0},b]}]}});

/**
 * ngPanel by @matsko
 * https://github.com/matsko/ng-panel
 */
DocsApp

  .directive('ngPanel', ['$animate', function($animate) {
    return {
      restrict: 'EA',
      transclude: 'element',
      terminal: true,
      compile: function(elm, attrs) {
        var attrExp = attrs.ngPanel || attrs['for'];
        var regex = /^(\S+)(?:\s+track by (.+?))?$/;
        var match = regex.exec(attrExp);

        var watchCollection = true;
        var objExp = match[1];
        var trackExp = match[2];
        if (trackExp) {
          watchCollection = false;
        } else {
          trackExp = match[1];
        }

        return function(scope, $element, attrs, ctrl, $transclude) {
          var previousElement, previousScope;
          scope[watchCollection ? '$watchCollection' : '$watch'](trackExp, function(value) {
            if (previousElement) {
              $animate.leave(previousElement);
            }
            if (previousScope) {
              previousScope.$destroy();
              previousScope = null;
            }
            var record = watchCollection ? value : scope.$eval(objExp);
            previousScope = scope.$new();
            $transclude(previousScope, function(element) {
              previousElement = element;
              $animate.enter(element, null, $element);
            });
          });
        };
      }
    };
  }]);

DocsApp
.constant('SERVICES', [
  {
    "name": "$mdMedia",
    "type": "service",
    "outputPath": "partials/api/material.core/service/$mdMedia.html",
    "url": "api/material.core/service/$mdMedia",
    "label": "$mdMedia",
    "hasDemo": false,
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services//material.core.js"
  }
]);
