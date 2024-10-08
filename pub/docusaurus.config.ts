import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DBPF.js',
  tagline: 'A performant DBPF file reader written in TypeScript ',
  favicon: 'img/favicon.ico',

  // Because our index is placed in the static/ folder, the broken links checker will go off like crazy
  onBrokenLinks: 'warn',

  url: 'https://anonhostpi.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: 'DBPF.js',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'anonhostpi', // Usually your GitHub org/user name.
  projectName: 'DBPF.js', // Usually your repo name.

  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          breadcrumbs: true,
          showLastUpdateTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          /* editUrl:
            'https://github.com/anonhostpi/DBPF.js/edit/main/README.md', */
        },
        /* blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        }, */
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/social-card.jpg',
    navbar: {
      title: 'DBPF.js',
      logo: {
        alt: 'DBPF.js',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'wikiSidebar',
          position: 'left',
          label: 'Docs',
        },
        // {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: '/docs/other/guides/Install',
          label: 'Install',
          position: 'right',
        },
        {
          href: '/playground',
          target: '_blank',
          label: 'Playground',
          position: 'right',
        },
        {
          href: 'https://github.com/anonhostpi/DBPF.js',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/dbpf',
          label: 'npm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'API',
              to: '/docs/API',
            },
            {
              label: 'DBPF File Format',
              to: '/docs/other/spec/',
            },
          ],
        },
        /* {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        }, */
        {
          title: 'Library',
          items: [
            /* {
              label: 'Blog',
              to: '/blog',
            }, */
            {
              label: 'GitHub',
              href: 'https://github.com/anonhostpi/DBPF.js',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/dbpf',
            },
          ],
        },
        {
          title: 'About',
          items: [
            {
              label: 'Home',
              to: '/',
            },
            {
              label: 'Readme',
              href: 'https://github.com/anonhostpi/DBPF.js/blob/main/README.md',
            },
            {
              label: 'License',
              href: 'https://github.com/anonhostpi/DBPF.js/blob/main/LICENSE',
            },
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} anonhostpi. Built with Github Actions.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
