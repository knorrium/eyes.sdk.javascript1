import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Single category', module)
  .add(
    'Story with local floating region by selector',
    () => {
      return (
        <div style={{width: '300px', height: '300px', backgroundColor: 'yellow'}}>
          <div
            className="floating-region"
            style={{
              width: '200px',
              height: '200px',
              margin: 'auto',
              padding: '30px',
              backgroundColor: 'blue',
            }}>
            story with floating region by selector
          </div>
        </div>
      );
    },
    {
      eyes: {
        floatingRegions: [
          {
            selector: '.floating-region',
            maxUpOffset: 0,
            maxDownOffset: 40,
            maxLeftOffset: 20,
            maxRightOffset: 20,
          },
        ],
      },
    },
  )
  .add(
    'Story with local floating region by coordinates',
    () => {
      return (
        <div style={{width: '300px', height: '300px', backgroundColor: 'yellow'}}>
          <div
            className="floating-region"
            style={{
              width: '200px',
              height: '200px',
              margin: 'auto',
              padding: '30px',
              backgroundColor: 'blue',
            }}>
            story with floating region by coordinates
          </div>
        </div>
      );
    },
    {
      eyes: {
        floatingRegions: [
          {
            region: {
              left: 36,
              top: 16,
              width: 260,
              height: 260,
            },
            maxUpOffset: 0,
            maxDownOffset: 40,
            maxLeftOffset: 20,
            maxRightOffset: 20,
          },
        ],
      },
    },
  );
