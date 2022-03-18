const doop = require('jsdoc/util/doop');
const env = require('jsdoc/env');
const fs = require('jsdoc/fs');
const helper = require('jsdoc/util/templateHelper');
const logger = require('jsdoc/util/logger');
const path = require('jsdoc/path');
const taffy = require('taffydb').taffy;
const template = require('jsdoc/template');
const util = require('util');

const htmlsafe = helper.htmlsafe;
const linkto = helper.linkto;
const resolveAuthorLinks = helper.resolveAuthorLinks;
const hasOwnProp = Object.prototype.hasOwnProperty;

let data;
let view;

let outdir = path.normalize(env.opts.destination);

function find(spec) {
  return helper.find(data, spec);
}

function tutoriallink(tutorial) {
  return helper.toTutorial(tutorial, null, {
    tag: 'em',
    classname: 'disabled',
    prefix: 'Tutorial: '
  });
}

function getAncestorLinks(doclet) {
  return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
  let url;

  if (!/^(#.+)/.test(hash)) { return hash; }

  url = helper.createLink(doclet);
  url = url.replace(/(#.+|$)/, hash);

  return `<a href="${url}">${hash}</a>`;
}

function needsSignature({kind, type, meta}) {
  let needsSig = false;

  // function and class definitions always get a signature
  if (kind === 'function' || kind === 'class') {
    needsSig = true;
  } else if (kind === 'typedef' && type && type.names &&
        type.names.length) {
          // typedefs that contain functions get a signature, too
    for (let i = 0, l = type.names.length; i < l; i++) {
      if (type.names[i].toLowerCase() === 'function') {
        needsSig = true;
        break;
      }
    }
  }
  // and namespaces that are functions get a signature (but finding them is a
  // bit messy)
  else if (kind === 'namespace' && meta && meta.code &&
      meta.code.type && meta.code.type.match(/[Ff]unction/)) {
      needsSig = true;
  }

  return needsSig;
}

function getSignatureAttributes({optional, nullable}) {
  var attributes = [];

  if (optional) {
    attributes.push('opt');
  }

  if (nullable === true) {
    attributes.push('nullable');
  } else if (nullable === false) {
    attributes.push('non-null');
  }

  return attributes;
}

function updateItemName(item) {
  var attributes = getSignatureAttributes(item);
  var itemName = item.name || '';

  if (item.variable) {
    itemName = `&hellip;${itemName}`;
  }

  if (attributes && attributes.length) {
    itemName = util.format('%s<span class="signature-attributes">%s</span>', itemName,
      attributes.join(', '));
  }

  return itemName;
}

function addParamAttributes(params) {
  return params.filter(({name}) => name && !name.includes('.')).map(updateItemName);
}

function buildItemTypeStrings(item) {
  let types = [];

  if (item && item.type && item.type.names) {
    item.type.names.forEach(function (name) {
      types.push(linkto(name, htmlsafe(name)));
    });
  }

  return types;
}

function buildAttribsString(attribs) {
  let attribsString = '';

  if (attribs && attribs.length) {
    attribsString = htmlsafe(util.format('(%s) ', attribs.join(', ')));
  }

  return attribsString;
}

function addNonParamAttributes(items) {
  let types = [];

  items.forEach(function (item) {
    types = types.concat(buildItemTypeStrings(item));
  });

  return types;
}

function addSignatureParams(f) {
  var params = f.params ? addParamAttributes(f.params) : [];

  f.signature = util.format('%s(%s)', f.signature || '', params.join(', '));
}

function addSignatureReturns(f) {
  const attribs = [];
  let attribsString = '';
  let returnTypes = [];
  let returnTypesString = '';
  const source = f.yields || f.returns;

  // jam all the return-type attributes into an array. this could create odd results (for example,
  // if there are both nullable and non-nullable return types), but let's assume that most people
  // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
  if (source) {
      source.forEach(item => {
          helper.getAttribs(item).forEach(attrib => {
              if (!attribs.includes(attrib)) {
                  attribs.push(attrib);
              }
          });
      });

      attribsString = buildAttribsString(attribs);
  }

  if (source) {
      returnTypes = addNonParamAttributes(source);
  }
  if (returnTypes.length) {
      returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join('|') );
  }

  f.signature = `<span class="signature">${f.signature || ''}</span><span class="type-signature">${returnTypesString}</span>`;
}

function addSignatureTypes(f) {
  var types = f.type ? buildItemTypeStrings(f) : [];

  f.signature = (f.signature || '') + '<span class="type-signature">' +
        (types.length ? ' :' + types.join('|') : '') + '</span>';
}

function addAttribs(f) {
  const attribs = helper.getAttribs(f);
  const attribsString = buildAttribsString(attribs);

  f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
}

function shortenPaths(files, commonPrefix) {
  Object.keys(files).forEach(function (file) {
    files[file].shortened = files[file].resolved.replace(commonPrefix, '')
    // always use forward slashes
      .replace(/\\/g, '/');
  });

  return files;
}

function getPathFromDoclet({meta}) {
  if (!meta) {
    return null;
  }

  return meta.path && meta.path !== 'null' ?
    path.join(meta.path, meta.filename) :
    meta.filename;
}

function generate(title, docs, filename, resolveLinks) {
  let docData;
  let html;
  let outpath;

  resolveLinks = resolveLinks !== false;

  docData = {
    env: env,
    title: title,
    docs: docs
  };

  outpath = path.join(outdir, filename);
  html = view.render('container.tmpl', docData);

  if (resolveLinks) {
    html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
  }

  fs.writeFileSync(outpath, html, 'utf8');
}

function generateSourceFiles(sourceFiles, encoding) {
  encoding = encoding || 'utf8';
  Object.keys(sourceFiles).forEach(file => {
    let source;
    // links are keyed to the shortened path in each doclet's `meta.shortpath` property
    const sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);

    helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

    try {
      source = {
        kind: 'source',
        code: helper.htmlsafe(fs.readFileSync(sourceFiles[file].resolved, encoding))
      };
    } catch (e) {
      logger.error('Error while generating source file %s: %s', file, e.message);
    }

    generate(`Source: ${sourceFiles[file].shortened}`, [source], sourceOutfile,
        false);
  });
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
    const symbols = {};

    // build a lookup table
    doclets.forEach(symbol => {
        symbols[symbol.longname] = symbols[symbol.longname] || [];
        symbols[symbol.longname].push(symbol);
    });

    modules.forEach(module => {
        if (symbols[module.longname]) {
            module.modules = symbols[module.longname]
                // Only show symbols that have a description. Make an exception for classes, because
                // we want to show the constructor-signature heading no matter what.
                .filter(({description, kind}) => description || kind === 'class')
                .map(symbol => {
                    symbol = doop(symbol);

                    if (symbol.kind === 'class' || symbol.kind === 'function') {
                        symbol.name = `${symbol.name.replace('module:', '(require("')}"))`;
                    }

                    return symbol;
                });
        }
    });
}

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn) {
  let nav = '';

  if (items.length) {
    let itemsNav = '';

    items.forEach(item => {
      let displayName;

      let methods = find({kind: 'function', memberof: item.longname});

      if (!hasOwnProp.call(item, 'longname')) {
        itemsNav += `<li id="${item.name.replace('/', '_')}-nav">${linktoFn('', item.name)}</li>`;
      } else if (!hasOwnProp.call(itemsSeen, item.longname)) {
        if (env.conf.templates.default.useLongnameInNav) {
            displayName = item.longname;
        } else {
            displayName = item.name;
        }
        itemsNav += `<li id="${item.name.replace('/', '_')}-nav">${linktoFn(item.longname, displayName.replace(/\b(module|event):/g, ''))}`;

        if (methods.length && env.conf.templates.showExpandedNav ) {
          itemsNav += "<ul class='methods'>";
          methods.forEach(method => {
            itemsNav += `<li data-type="method" id="${item.name.replace('/', '_')}-nav">${linkto(method.longname, method.name)}</li>`;
          });
          itemsNav += '</ul>';
        }
        itemsSeen[item.longname] = true;
        itemsNav += '</li>';
      }
    });

    if (itemsNav !== '') {
    nav += `<h3>${itemHeading}</h3><ul>${itemsNav}</ul>`;
    }
  }

  return nav;
}

function linktoTutorial(longName, name) {
  return tutoriallink(name);
}

function linktoExternal(longName, name) {
  return linkto(longName, name.replace(/(^"|"$)/g, ''));
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
  let nav = '';
  let globalNav = '';
  let seen = {};
  let seenTutorials = {};

  nav += buildMemberNav(members.modules, 'Modules', {}, linkto);
  nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal);
  nav += buildMemberNav(members.namespaces, 'Namespaces', seen, linkto);
  nav += buildMemberNav(members.classes, 'Classes', seen, linkto);
  nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto);
  nav += buildMemberNav(members.events, 'Events', seen, linkto);
  nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto);
  nav += buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial);

  if (members.globals.length) {
    globalNav = '';
    members.globals.forEach(({kind, longname, name}) => {
      if (kind !== 'typedef' && !hasOwnProp.call(seen, longname)) {
        globalNav += `<li>${linkto(longname, name)}</li>`;
      }
      seen[longname] = true;
    });

    if (!globalNav) {
      // turn the heading into a link so you can actually get to the global page
      nav += `<h3 id="global-nav">${linkto('global', 'Global')}</h3>`;
    } else {
      nav += `<h3 id="global-nav">Global</h3><ul>${globalNav}</ul>`;
    }
  }
  if ( env.conf.templates.repository ) {
    nav += `<div class="repo-link">
    <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
    <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
</svg>
    <a href="${env.conf.templates.repository}">Repository</a>
    </div>`
  }

  return nav;
}

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function (taffyData, opts, tutorials) {
  let classes;
  let conf;
  let externals;
  let files;
  let fromDir;
  let globalUrl;
  let indexUrl;
  let interfaces;
  let members;
  let mixins;
  let modules;
  let namespaces;
  let outputSourceFiles;
  let packageInfo;
  let packages;
  let sourceFilePaths = [];
  let sourceFiles = {};
  let staticFileFilter;
  let staticFilePaths;
  let staticFiles;
  let staticFileScanner;
  let templatePath;

  data = taffyData;

  conf = env.conf.templates || {};
  conf.default = conf.default || {};

  templatePath = path.normalize(opts.template);

  view = new template.Template(path.join(templatePath, 'tmpl'));

  // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
  // doesn't try to hand them out later
  indexUrl = helper.getUniqueFilename('index');

  // don't call registerLink() on this one! 'index' is also a valid longname
  globalUrl = helper.getUniqueFilename('global');

  helper.registerLink('global', globalUrl);

  // set up templating
  view.layout = conf.default.layoutFile ?
    path.getResourcePath(path.dirname(conf.default.layoutFile),
      path.basename(conf.default.layoutFile)) :
    'layout.tmpl';

  // set up tutorials for helper
  helper.setTutorials(tutorials);

  data = helper.prune(data);
  if (!conf.disableSort) {
    data.sort('longname, version, since');
  }
  helper.addEventListeners(data);

  sourceFiles = {};
  sourceFilePaths = [];

  data().each(doclet => {
    doclet.attribs = '';

    if (doclet.examples) {
      doclet.examples = doclet.examples.map( example => {
        var caption, code;

        if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
          caption = RegExp.$1;
          code = RegExp.$3;
        }

        return {
          caption: caption || '',
          code: code || example
        };
      });
    }
    if (doclet.see) {
      doclet.see.forEach((seeItem, i) => {
        doclet.see[i] = hashToLink(doclet, seeItem);
      });
    }

    // build a list of source files
    var sourcePath;

    if (doclet.meta) {
      sourcePath = getPathFromDoclet(doclet);
      sourceFiles[sourcePath] = {
        resolved: sourcePath,
        shortened: null
      };
      if (!sourceFilePaths.includes(sourcePath)) {
        sourceFilePaths.push(sourcePath);
      }
    }
  });

  // update outdir if necessary, then create outdir
  packageInfo = (find({kind: 'package'}) || [])[0];

  if (packageInfo && packageInfo.name) {
    outdir = path.join(outdir, packageInfo.name, packageInfo.version || '');
  }
  fs.mkPath(outdir);

  // copy the template's static files to outdir
  fromDir = path.join(templatePath, 'static');
  staticFiles = fs.ls(fromDir, 3);

  staticFiles.forEach( fileName => {
    const toDir = fs.toDir(fileName.replace(fromDir, outdir));

    fs.mkPath(toDir);
    fs.copyFileSync(fileName, toDir);
  });

  // copy user-specified static files to outdir
  if (conf.default.staticFiles) {
    // The canonical property name is `include`. We accept `paths` for backwards compatibility
    // with a bug in JSDoc 3.2.x.
    staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
    staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles);
    staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

    staticFilePaths.forEach(filePath => {
      let extraStaticFiles;

      filePath = path.resolve(env.pwd, filePath);
      extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

      extraStaticFiles.forEach(fileName => {
        const sourcePath = fs.toDir(filePath);
        const toDir = fs.toDir( fileName.replace(sourcePath, outdir) );

        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
      });
    });
  }

  if (sourceFilePaths.length) {
    sourceFiles = shortenPaths(sourceFiles, path.commonPrefix(sourceFilePaths));
  }
  data().each( doclet => {
    var docletPath;
    var url = helper.createLink(doclet);

    helper.registerLink(doclet.longname, url);

    // add a shortened version of the full path
    if (doclet.meta) {
      docletPath = getPathFromDoclet(doclet);
      docletPath = sourceFiles[docletPath].shortened;
      if (docletPath) {
        doclet.meta.shortpath = docletPath;
      }
    }
  });

  data().each( doclet => {
    const url = helper.longnameToUrl[doclet.longname];

    if (url.includes('#')) {
      doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
    } else {
      doclet.id = doclet.name;
    }

    if (needsSignature(doclet)) {
      addSignatureParams(doclet);
      addSignatureReturns(doclet);
      addAttribs(doclet);
    }
  });

  // do this after the urls have all been generated
  data().each( doclet => {
    doclet.ancestors = getAncestorLinks(doclet);

    if ((doclet.kind === 'member' || doclet.kind === 'event' || doclet.kind === 'typedef') && doclet.signature == null) {
      addSignatureTypes(doclet);
      addAttribs(doclet);
    }

    if (doclet.kind === 'constant') {
      addSignatureTypes(doclet);
      addAttribs(doclet);
      doclet.kind = 'member';
    }
  });

  members = helper.getMembers(data);

  members.tutorials = tutorials.children;

  // output pretty-printed source files by default
  outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false;

  // add template helpers
  view.find = find;
  view.linkto = linkto;
  view.resolveAuthorLinks = resolveAuthorLinks;
  view.tutoriallink = tutoriallink;
  view.htmlsafe = htmlsafe;
  view.outputSourceFiles = outputSourceFiles;

  // once for all
  view.nav = buildNav(members);
  attachModuleSymbols(find({longname: {left: 'module:'}}), members.modules);

  // generate the pretty-printed source files first so other pages can link to them
  if (outputSourceFiles) {
    generateSourceFiles(sourceFiles, opts.encoding);
  }

  if (members.globals.length) {
    generate('Global', [{kind: 'globalobj'}], globalUrl);
  }

  // index page displays information from package.json and lists files
  files = find({kind: 'file'});
  packages = find({kind: 'package'});

  generate('Home',
    packages.concat(
      [{
        kind: 'mainpage',
        readme: opts.readme,
        longname: opts.mainpagetitle ? opts.mainpagetitle : 'Main Page'
      }]
    ).concat(files), indexUrl);

  // set up the lists that we'll use to generate pages
  classes = taffy(members.classes);
  modules = taffy(members.modules);
  namespaces = taffy(members.namespaces);
  mixins = taffy(members.mixins);
  externals = taffy(members.externals);
  interfaces = taffy(members.interfaces);

  Object.keys(helper.longnameToUrl).forEach(function (longname) {
    const myClasses = helper.find(classes, {longname: longname});
    const myExternals = helper.find(externals, {longname: longname});
    const myInterfaces = helper.find(interfaces, {longname: longname});
    const myMixins = helper.find(mixins, {longname: longname});
    const myModules = helper.find(modules, {longname: longname});
    const myNamespaces = helper.find(namespaces, {longname: longname});

    if (myModules.length) {
        generate(`Module: ${myModules[0].name}`, myModules, helper.longnameToUrl[longname]);
    }

    if (myClasses.length) {
        generate(`Class: ${myClasses[0].name}`, myClasses, helper.longnameToUrl[longname]);
    }

    if (myNamespaces.length) {
        generate(`Namespace: ${myNamespaces[0].name}`, myNamespaces, helper.longnameToUrl[longname]);
    }

    if (myMixins.length) {
        generate(`Mixin: ${myMixins[0].name}`, myMixins, helper.longnameToUrl[longname]);
    }

    if (myExternals.length) {
        generate(`External: ${myExternals[0].name}`, myExternals, helper.longnameToUrl[longname]);
    }

    if (myInterfaces.length) {
        generate(`Interface: ${myInterfaces[0].name}`, myInterfaces, helper.longnameToUrl[longname]);
    }
});

  function generateTutorial(title, tutorial, filename) {
    const tutorialData = {
      title: title,
      header: tutorial.title,
      content: tutorial.parse(),
      children: tutorial.children
    };

    const tutorialPath = path.join(outdir, filename);
    let html = view.render('tutorial.tmpl', tutorialData);

    // yes, you can use {@link} in tutorials too!
    html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    fs.writeFileSync(tutorialPath, html, 'utf8');
  }

  // tutorials can have only one parent so there is no risk for loops
  function saveChildren(node) {
    node.children.forEach(function (child) {
      generateTutorial('Tutorial: ' + child.title, child, helper.tutorialToUrl(child.name));
      saveChildren(child);
    });
  }

  saveChildren(tutorials);
};
