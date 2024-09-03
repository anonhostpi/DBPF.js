"use strict";(self.webpackChunkpub_build=self.webpackChunkpub_build||[]).push([[5519],{5668:(e,n,c)=>{c.r(n),c.d(n,{assets:()=>l,contentTitle:()=>i,default:()=>o,frontMatter:()=>d,metadata:()=>h,toc:()=>t});var s=c(1085),r=c(1184);const d={title:"LFUCache",last_update:{date:"9/3/2024",author:"Automation"}},i=void 0,h={id:"LFUCache/classes/LFUCache",title:"LFUCache",description:"DBPF.js v1.0.7 \u2022 Docs",source:"@site/docs/LFUCache/classes/LFUCache.md",sourceDirName:"LFUCache/classes",slug:"/LFUCache/classes/LFUCache",permalink:"/DBPF.js/docs/LFUCache/classes/LFUCache",draft:!1,unlisted:!1,tags:[],version:"current",lastUpdatedAt:17253216e5,frontMatter:{title:"LFUCache",last_update:{date:"9/3/2024",author:"Automation"}}},l={},t=[{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new LFUCache()",id:"new-lfucache",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_cache",id:"cache",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"/ _capacity",id:"-capacity",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"/ _freq",id:"-freq",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"/ _minFreq",id:"-minfreq",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"/ _ttl",id:"-ttl",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"_evict()",id:"evict",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"/ _increment()",id:"-increment",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"/ _refresh()",id:"-refresh",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"get()",id:"get",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"set()",id:"set",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4}];function a(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",hr:"hr",p:"p",strong:"strong",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/DBPF.js/docs/API",children:(0,s.jsx)(n.strong,{children:"DBPF.js v1.0.7"})})," \u2022 ",(0,s.jsx)(n.strong,{children:"Docs"})]}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/DBPF.js/docs/API",children:"DBPF.js v1.0.7"})," / ",(0,s.jsx)(n.a,{href:"/DBPF.js/docs/LFUCache/",children:"LFUCache"})," / LFUCache"]}),"\n",(0,s.jsx)(n.h1,{id:"class-lfucacheindextype-cachedvaluetype",children:"Class: LFUCache<IndexType, CachedValueType>"}),"\n",(0,s.jsx)(n.p,{children:"LFUCache"}),"\n",(0,s.jsx)(n.p,{children:"A simple implementation of a Least Frequently Used Cache with TTL"}),"\n",(0,s.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"IndexType"})]}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"CachedValueType"})]}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-lfucache",children:"new LFUCache()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new LFUCache"}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CachedValueType"}),">(",(0,s.jsx)(n.code,{children:"capacity"}),", ",(0,s.jsx)(n.code,{children:"ttl"}),"): ",(0,s.jsx)(n.a,{href:"/DBPF.js/docs/LFUCache/classes/LFUCache",children:(0,s.jsx)(n.code,{children:"LFUCache"})}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CachedValueType"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"capacity"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n",(0,s.jsx)(n.p,{children:"The amount of entries the cache can store"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"ttl"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n",(0,s.jsx)(n.p,{children:"The time-to-live of the cache entries"}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/DBPF.js/docs/LFUCache/classes/LFUCache",children:(0,s.jsx)(n.code,{children:"LFUCache"})}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CachedValueType"}),">"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L39",children:"src/LFUCache.ts:39"})}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"cache",children:"_cache"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_cache"}),": ",(0,s.jsx)(n.code,{children:"Map"}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CacheEntry"}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CachedValueType"}),">>"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The underlying Map object used to store the cache entries"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L64",children:"src/LFUCache.ts:64"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"-capacity",children:"/ _capacity"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_capacity"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The capacity of the cache"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L54",children:"src/LFUCache.ts:54"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"-freq",children:"/ _freq"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_freq"}),": ",(0,s.jsx)(n.code,{children:"Map"}),"<",(0,s.jsx)(n.code,{children:"number"}),", ",(0,s.jsx)(n.code,{children:"Set"}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),">>"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The frequency map used to track the usage frequency of the cache entries"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L69",children:"src/LFUCache.ts:69"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"-minfreq",children:"/ _minFreq"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_minFreq"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The lowest usage frequency of the stored cache entries"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L74",children:"src/LFUCache.ts:74"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"-ttl",children:"/ _ttl"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_ttl"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The time-to-live of the cache entries"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L59",children:"src/LFUCache.ts:59"})}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"evict",children:"_evict()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_evict"}),"(",(0,s.jsx)(n.code,{children:"entry"}),"?): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The function used to evict entries from the cache"}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"entry?"}),": ",(0,s.jsx)(n.code,{children:"CacheEntry"}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CachedValueType"}),">"]}),"\n",(0,s.jsx)(n.p,{children:"If provided, evicts the provided entry, otherwise evicts the least recently used entry"}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L81",children:"src/LFUCache.ts:81"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"-increment",children:"/ _increment()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_increment"}),"(",(0,s.jsx)(n.code,{children:"entry"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Increment the usage frequency of an entry"}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"entry"}),": ",(0,s.jsx)(n.code,{children:"CacheEntry"}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CachedValueType"}),">"]}),"\n",(0,s.jsx)(n.p,{children:"The entry to increment the usage frequency of"}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L104",children:"src/LFUCache.ts:104"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"-refresh",children:"/ _refresh()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"private"})," ",(0,s.jsx)(n.strong,{children:"_refresh"}),"(",(0,s.jsx)(n.code,{children:"entry"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Refresh the TTL of an entry"}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"entry"}),": ",(0,s.jsx)(n.code,{children:"CacheEntry"}),"<",(0,s.jsx)(n.code,{children:"IndexType"}),", ",(0,s.jsx)(n.code,{children:"CachedValueType"}),">"]}),"\n",(0,s.jsx)(n.p,{children:"The entry to refresh the TTL of"}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L127",children:"src/LFUCache.ts:127"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"get",children:"get()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"get"}),"(",(0,s.jsx)(n.code,{children:"index"}),"): ",(0,s.jsx)(n.code,{children:"undefined"})," | ",(0,s.jsx)(n.code,{children:"CachedValueType"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The getter function to retrieve an entry from the cache"}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"index"}),": ",(0,s.jsx)(n.code,{children:"IndexType"})]}),"\n",(0,s.jsx)(n.p,{children:"The index of the entry to retrieve"}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"undefined"})," | ",(0,s.jsx)(n.code,{children:"CachedValueType"})]}),"\n",(0,s.jsx)(n.p,{children:"The value of the entry if found, otherwise undefined"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L137",children:"src/LFUCache.ts:137"})}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"set",children:"set()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"set"}),"(",(0,s.jsx)(n.code,{children:"index"}),", ",(0,s.jsx)(n.code,{children:"value"}),"): ",(0,s.jsx)(n.code,{children:"CachedValueType"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The setter function to set an entry in the cache"}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"index"}),": ",(0,s.jsx)(n.code,{children:"IndexType"})]}),"\n",(0,s.jsx)(n.p,{children:"The index of the entry to set"}),"\n",(0,s.jsxs)(n.p,{children:["\u2022 ",(0,s.jsx)(n.strong,{children:"value"}),": ",(0,s.jsx)(n.code,{children:"CachedValueType"})]}),"\n",(0,s.jsx)(n.p,{children:"The value of the entry to set"}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"CachedValueType"})}),"\n",(0,s.jsx)(n.p,{children:"The value of the entry"}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/anonhostpi/DBPF.js/blob/33c03ce76901c1949cfc2af1f6649049ab1d0572/src/LFUCache.ts#L152",children:"src/LFUCache.ts:152"})})]})}function o(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},1184:(e,n,c)=>{c.d(n,{R:()=>i,x:()=>h});var s=c(4041);const r={},d=s.createContext(r);function i(e){const n=s.useContext(d);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function h(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),s.createElement(d.Provider,{value:n},e.children)}}}]);