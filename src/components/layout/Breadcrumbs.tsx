'use client';

import { Breadcrumb } from '@chakra-ui/react';
import { LiaSlashSolid } from 'react-icons/lia';
import { Fragment } from 'react';

type BreadcrumbsProps = {
  pathname: string;
  headingsMap: Record<string, string>;
};

export function Breadcrumbs({ pathname, headingsMap }: BreadcrumbsProps) {
  const paths = Object.keys(headingsMap)
    .filter(p => pathname.startsWith(p))
    .sort((a, b) => a.length - b.length);

  if (paths.length === 0) return null;

  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {paths.map((p, i) => {
          const last = i === paths.length - 1;
          return (
            <Fragment key={p}>
              <Breadcrumb.Item>
                {last ? (
                  <Breadcrumb.CurrentLink color="secondaryText.500">
                    {headingsMap[p]}
                  </Breadcrumb.CurrentLink>
                ) : (
                  <Breadcrumb.Link href={p} color="primary.500">
                    {headingsMap[p]}
                  </Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
              {!last && (
                <Breadcrumb.Separator>
                  <LiaSlashSolid />
                </Breadcrumb.Separator>
              )}
            </Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
