import React from 'react';

const theme = new URL(window.location).searchParams.get('theme');
document.documentElement.setAttribute('theme', theme || 'light')

export const Theme = () => {
  const theme = document.documentElement.getAttribute('theme');
  return <section>
      <div>{theme}</div>
    </section>
}