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

<h3><a name="routing-routes"><p>Routes</p>
</a></h3>

<h4><a name="routing-routes-overview"><p>Routes overview</p>
</a></h4>

| Route                                       | Method   | Disabled | Description |
| ------------------------------------------- | -------- | -------- | ----------- |
| [/database/content](#GET__database_content) | `GET`    |          |             |
| [/database](#DELETE__database)              | `DELETE` | `true`   |             |
| [/database](#GET__database)                 | `GET`    |          |             |
| [/database](#PATCH__database)               | `PATCH`  | `true`   |             |
| [/database](#POST__database)                | `POST`   | `true`   |             |
| [/database](#PUT__database)                 | `PUT`    | `true`   |             |

<h4><a name="routing-routes-detail"><p>Routes detail</p>
</a></h4>

<h5><a name="GET__database_content"><p><code>GET</code> /database/content</p>
</a></h5>

**Response**

`string`

---

<h5><a name="DELETE__database"><p><code>DELETE</code> /database</p>
</a></h5>

`DISABLED`

**Response**

`void`

---

<h5><a name="GET__database"><p><code>GET</code> /database</p>
</a></h5>

**Response**

`string`

---

<h5><a name="PATCH__database"><p><code>PATCH</code> /database</p>
</a></h5>

`DISABLED`

**Response**

`void`

---

<h5><a name="POST__database"><p><code>POST</code> /database</p>
</a></h5>

`DISABLED`

**Response**

`void`

---

<h5><a name="PUT__database"><p><code>PUT</code> /database</p>
</a></h5>

`DISABLED`

**Response**

`void`

---

</section>

<section id="license" data-note="AUTO-GENERATED CONTENT, DO NOT EDIT DIRECTLY!">

## License

**@sheetbase/database** is released under the [MIT](https://github.com/sheetbase/database/blob/master/LICENSE) license.

</section>
