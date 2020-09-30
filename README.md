<section id="head" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

# @sheetbase/database

**Using Google Sheets as a database.**

</section>

<section id="tocx" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

- [Installation](#installation)
- [Options](#options)
- [Lib](#lib)
  - [Lib properties](#lib-properties)
  - [Lib methods](#lib-methods)
    - [`registerRoutes(routeEnabling?)`](#lib-registerroutes-0)
- [Routing](#routing)
  - [Errors](#routing-errors)
  - [Routes](#routing-routes)
    - [Routes overview](#routing-routes-overview)
    - [Routes detail](#routing-routes-detail)
      - [`GET` /database/content](#GET__database_content)
      - [`DELETE` /database](#DELETE__database)
      - [`GET` /database](#GET__database)
      - [`PATCH` /database](#PATCH__database)
      - [`POST` /database](#POST__database)
      - [`PUT` /database](#PUT__database)
- [Detail API reference](https://sheetbase.github.io/database)


</section>

<section id="installation" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

<h2><a name="installation"><p>Installation</p>
</a></h2>

- Install: `npm install --save @sheetbase/database`

- Usage:

```ts
// 1. import module
import { DatabaseModule } from "@sheetbase/database";

// 2. create an instance
export class App {
  // the object
  databaseModule: DatabaseModule;

  // initiate the instance
  constructor() {
    this.databaseModule = new DatabaseModule(/* options */);
  }
}
```

</section>

<section id="options" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

<h2><a name="options"><p>Options</p>
</a></h2>

| Name                                                                                             | Type                                                                                                                            | Description |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [AuthToken?](https://sheetbase.github.io/database/interfaces/options.html#authtoken)             | <code><a href="https://sheetbase.github.io/database/globals.html" target="_blank">AuthToken</a></code>                          |             |
| [**databaseId**](https://sheetbase.github.io/database/interfaces/options.html#databaseid)        | <code>string</code>                                                                                                             |             |
| [keyFields?](https://sheetbase.github.io/database/interfaces/options.html#keyfields)             | <code>undefined \| object</code>                                                                                                |             |
| [security?](https://sheetbase.github.io/database/interfaces/options.html#security)               | <code>boolean \| object</code>                                                                                                  |             |
| [securityHelpers?](https://sheetbase.github.io/database/interfaces/options.html#securityhelpers) | <code><a href="https://sheetbase.github.io/database/interfaces/securityhelpers.html" target="_blank">SecurityHelpers</a></code> |             |

</section>

<section id="lib" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

<h2><a name="lib" href="https://sheetbase.github.io/database/classes/lib.html"><p>Lib</p>
</a></h2>

**The `Lib` class.**

<h3><a name="lib-properties"><p>Lib properties</p>
</a></h3>

| Name                                                                                               | Type                                                                                                                                   | Description |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [databaseContentRoute](https://sheetbase.github.io/database/classes/lib.html#databasecontentroute) | <code><a href="https://sheetbase.github.io/database/classes/databasecontentroute.html" target="_blank">DatabaseContentRoute</a></code> |             |
| [databaseRoute](https://sheetbase.github.io/database/classes/lib.html#databaseroute)               | <code><a href="https://sheetbase.github.io/database/classes/databaseroute.html" target="_blank">DatabaseRoute</a></code>               |             |
| [databaseService](https://sheetbase.github.io/database/classes/lib.html#databaseservice)           | <code><a href="https://sheetbase.github.io/database/classes/databaseservice.html" target="_blank">DatabaseService</a></code>           |             |
| [filterService](https://sheetbase.github.io/database/classes/lib.html#filterservice)               | <code><a href="https://sheetbase.github.io/database/classes/filterservice.html" target="_blank">FilterService</a></code>               |             |
| [helperService](https://sheetbase.github.io/database/classes/lib.html#helperservice)               | <code><a href="https://sheetbase.github.io/database/classes/helperservice.html" target="_blank">HelperService</a></code>               |             |

<h3><a name="lib-methods"><p>Lib methods</p>
</a></h3>

| Function                                                | Returns type                 | Description              |
| ------------------------------------------------------- | ---------------------------- | ------------------------ |
| [registerRoutes(routeEnabling?)](#lib-registerroutes-0) | <code>RouterService<></code> | Expose the module routes |

<h4><a name="lib-registerroutes-0" href="https://sheetbase.github.io/database/classes/lib.html#registerroutes"><p><code>registerRoutes(routeEnabling?)</code></p>
</a></h4>

**Expose the module routes**

**Parameters**

| Param         | Type                                | Description |
| ------------- | ----------------------------------- | ----------- |
| routeEnabling | <code>true \| DisabledRoutes</code> |             |

**Returns**

<code>RouterService<></code>

---

</section>

<section id="routing" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

<h2><a name="routing"><p>Routing</p>
</a></h2>

**DatabaseModule** provides REST API endpoints allowing clients to access server resources. Theses enpoints are not exposed by default, to expose the endpoints:

```ts
DatabaseModule.registerRoutes(routeEnabling?);
```

<h3><a name="routing-errors"><p>Errors</p>
</a></h3>

**DatabaseModule** returns these routing errors, you may use the error code to customize the message:

- `database/content-no-id`: No doc id.
- `database/no-input`: No path/table/sheet.

<h3><a name="routing-routes"><p>Routes</p>
</a></h3>

<h4><a name="routing-routes-overview"><p>Routes overview</p>
</a></h4>

| Route                                       | Method   | Disabled | Description                                                 |
| ------------------------------------------- | -------- | -------- | ----------------------------------------------------------- |
| [/database/content](#GET__database_content) | `GET`    |          | Get doc content                                             |
| [/database](#DELETE__database)              | `DELETE` | `true`   | Delete an item from the database (proxy to: post /database) |
| [/database](#GET__database)                 | `GET`    |          | Get data from the database                                  |
| [/database](#PATCH__database)               | `PATCH`  | `true`   | Update an item from the database (proxy to: post /database) |
| [/database](#POST__database)                | `POST`   | `true`   | Add/update/delete data from database                        |
| [/database](#PUT__database)                 | `PUT`    | `true`   | Add a new item do the database (proxy to: post /database)   |

<h4><a name="routing-routes-detail"><p>Routes detail</p>
</a></h4>

<h5><a name="GET__database_content"><p><code>GET</code> /database/content</p>
</a></h5>

Get doc content

**Request query**

| Name      | Type                  | Description |
| --------- | --------------------- | ----------- |
| **docId** | <a data-sref="string"><code>string</code></a>            |             |
| style?    | <a data-sref="DocsContentStyles" href="https://sheetbase.github.io/database/globals.html#docscontentstyles"><code>DocsContentStyles</code></a> |             |

**Response**

`object`

---

<h5><a name="DELETE__database"><p><code>DELETE</code> /database</p>
</a></h5>

`DISABLED` Delete an item from the database (proxy to: post /database)

**Response**

`void`

---

<h5><a name="GET__database"><p><code>GET</code> /database</p>
</a></h5>

Get data from the database

**Request query**

| Name     | Type                   | Description |
| -------- | ---------------------- | ----------- |
| path?    | <a data-sref="string"><code>string</code></a>             |             |
| table?   | <a data-sref="string"><code>string</code></a>             |             |
| sheet?   | <a data-sref="string"><code>string</code></a>             |             |
| id?      | <a data-sref="string"><code>string</code></a>             |             |
| key?     | <a data-sref="string"><code>string</code></a>             |             |
| type?    | <a data-sref="'list' \"><p>'object'</p>
</a> |             |
| query?   | <a data-sref="string"><code>string</code></a>             |             |
| segment? | <a data-sref="string"><code>string</code></a>             |             |
| order?   | <a data-sref="string"><code>string</code></a>             |             |
| orderBy? | <a data-sref="string"><code>string</code></a>             |             |
| limit?   | <a data-sref="number"><code>number</code></a>             |             |
| offset?  | <a data-sref="number"><code>number</code></a>             |             |

**Response**

`Record<string, unknown> | unknown[]`

---

<h5><a name="PATCH__database"><p><code>PATCH</code> /database</p>
</a></h5>

`DISABLED` Update an item from the database (proxy to: post /database)

**Response**

`void`

---

<h5><a name="POST__database"><p><code>POST</code> /database</p>
</a></h5>

`DISABLED` Add/update/delete data from database

**Request body**

| Name        | Type                       | Description |
| ----------- | -------------------------- | ----------- |
| **path**    | <a data-sref="string"><code>string</code></a>                 |             |
| table?      | <a data-sref="string"><code>string</code></a>                 |             |
| sheet?      | <a data-sref="string"><code>string</code></a>                 |             |
| id?         | <a data-sref="string"><code>string</code></a>                 |             |
| key?        | <a data-sref="string"><code>string</code></a>                 |             |
| data?       | <a data-sref="unknown"><code>unknown</code></a>                |             |
| increasing? | <a data-sref="Record<string, number>"><code>Record<string, number></code></a> |             |
| clean?      | <a data-sref="boolean"><code>boolean</code></a>                |             |

**Response**

`TextOutput`

---

<h5><a name="PUT__database"><p><code>PUT</code> /database</p>
</a></h5>

`DISABLED` Add a new item do the database (proxy to: post /database)

**Response**

`void`

---

</section>

<section id="license" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

## License

**@sheetbase/database** is released under the [MIT](https://github.com/sheetbase/database/blob/master/LICENSE) license.

</section>
