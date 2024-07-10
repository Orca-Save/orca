'use client';
import { Button, Input, List } from 'antd';
import { Fragment, useState } from 'react';
import { createApi } from 'unsplash-js';
import { ApiResponse } from 'unsplash-js/dist/helpers/response';
import { Basic } from 'unsplash-js/dist/methods/photos/types';
import { Photos } from 'unsplash-js/dist/methods/search/types/response';

const { Search } = Input;

const api = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
});

const PhotoComp = ({ photo }: { photo: Basic }) => {
  const { user, urls } = photo;

  return (
    <Fragment>
      <img
        className='img transition-transform duration-300 hover:scale-110'
        src={urls.thumb}
      />
    </Fragment>
  );
};

export default function UnsplashForm({
  defaultValue,
  onSelect,
}: {
  defaultValue?: string;
  onSelect: (value: string) => void;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<Basic | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(true);
  const [value, setValue] = useState<string | undefined>(defaultValue);
  const [data, setPhotosResponse] = useState<ApiResponse<Photos> | null>(null);

  const search = (query: string) => {
    if (!query) return;
    setLoading(true);
    api.search
      .getPhotos({ query, orientation: 'landscape' })
      .then((result) => {
        setPhotosResponse(result);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        console.error('something went wrong!');
      });
  };
  if (previewMode) {
    let src = value;
    if (!value?.includes('orcasavestorage')) src += '&h=150';
    return (
      <>
        <Button data-id='search-image' onClick={() => setPreviewMode(false)}>
          Search Image
        </Button>
        {value ? (
          <img
            className='img'
            style={
              value?.includes('orcasavestorage')
                ? { height: '150px' }
                : undefined
            }
            src={src}
            alt='Image for goal'
          />
        ) : (
          <div>No image selected</div>
        )}
      </>
    );
  }

  if (data?.errors) {
    return (
      <div>
        <div>{data.errors[0]}</div>
        <div>PS: Make sure to set your access token!</div>
      </div>
    );
  } else {
    return (
      <>
        <Input value={value} defaultValue={defaultValue} className='hidden' />
        <Search
          placeholder='Search for images'
          loading={loading}
          onPressEnter={(e) => {
            e.preventDefault();
            search(e.currentTarget.value);
          }}
          onSearch={search}
          enterButton
        />
        <List
          grid={{
            gutter: 10,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          }}
          dataSource={data?.response.results}
          renderItem={(photo: any) => (
            <List.Item
              key={photo.id}
              onClick={() => {
                setSelectedPhoto(photo);
                setValue(photo.urls.small);
                onSelect(photo.urls.small);
                setPreviewMode(true);
                setPhotosResponse(null);
              }}
            >
              <PhotoComp photo={photo} />
            </List.Item>
          )}
        />
      </>
    );
  }
}
