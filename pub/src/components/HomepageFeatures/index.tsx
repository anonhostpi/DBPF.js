import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { Link } from 'react-router-dom';

type FeatureItem = {
  title: string;
  Image: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use and Fast',
    Image: require('@site/static/img/alien_mountain.png').default,
    description: (
      <>
        DBPF.js is an optimized library based on <Link to="/docs/spec">other DBPF readers</Link>.
        It is designed with the same interactions and structures in mind. Any differences between our reader and others is
        well documented in the <Link to="/docs/spec">wiki</Link>. If it isn't, please let us know! Our wiki is a community effort.
      </>
    ),
  },
  {
    title: 'Use on DBPF Files of Any Kind (WIP)',
    Image: require('@site/static/img/dbpf_games.png').default,
    description: (
      <>
        DBPF.js is designed to work many revisions of the DBPF format.
        Currently, it is tailored towards The Sims 4, but it should work with other Maxis games as well.
        Some more work needs to be done to fully support DBPF v1.0, but this will be added in the future.
        Work is also being done to support parsing the entries with a plugin system.
      </>
    ),
  },
  {
    title: 'Powered by TypeScript',
    Image: require('@site/static/img/dbpf_typescript.png').default,
    description: (
      <>
        DBPF.js is written with type safety in mind. This means that you can use DBPF.js in both TypeScript and JavaScript projects.
      </>
    ),
  },
];

function Feature({ title, Image, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={Image} className={styles.featureImg} alt={title} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}


export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
