'use client';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { createApi } from 'unsplash-js';
import { Photos } from 'unsplash-js/dist/methods/search/types/response';
import { ApiResponse } from 'unsplash-js/dist/helpers/response';
import { Basic } from 'unsplash-js/dist/methods/photos/types';

const api = createApi({
  accessKey: '',
});

const PhotoComp = ({ photo }: { photo: Basic }) => {
  const { user, urls } = photo;

  return (
    <Fragment>
      <img className='img' src={urls.regular} />
      {/* <a
        className='credit'
        target='_blank'
        href={`https://unsplash.com/@${user.username}`}>
        {user.name}
      </a> */}
    </Fragment>
  );
};

export default function UnsplashForm() {
  const [data, setPhotosResponse] = useState<ApiResponse<Photos> | null>(null);

  const search = (query: string) => {
    api.search
      .getPhotos({ query, orientation: 'landscape' })
      .then((result) => {
        setPhotosResponse(result);
      })
      .catch(() => {
        console.log('something went wrong!');
      });
  };

  if (data === null) {
    return <div>Loading...</div>;
  } else if (data.errors) {
    return (
      <div>
        <div>{data.errors[0]}</div>
        <div>PS: Make sure to set your access token!</div>
      </div>
    );
  } else {
    return (
      <div className='feed'>
        <ul className='columnUl'>
          {data.response.results.map((photo) => (
            <li key={photo.id} className='li'>
              <PhotoComp photo={photo} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
