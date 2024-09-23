import { Capacitor } from '@capacitor/core';
import { Button, Modal, Skeleton, Typography } from 'antd';
import { useState } from 'react';
import { PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link';
import { Link } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import { apiFetch } from '../../utils/general';

const { Paragraph, Text } = Typography;

interface LinkProps {
  linkToken: string | null;
  size?: 'small' | 'large' | 'middle';
  text?: string;
  overrideExistingAccountCheck?: boolean;
}

const LinkButton = (props: LinkProps) => {
  const { data } = useFetch('api/components/plaidLink', 'GET');

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isExistingInstitutionModalOpen, setIsExistingInstitutionModalOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PlaidLinkOnSuccessMetadata | null>(
    null
  );

  const onSuccess = async (
    public_token: string,
    metadata: PlaidLinkOnSuccessMetadata
  ) => {
    const results = await exchangePublicToken(
      public_token,
      metadata,
      props.overrideExistingAccountCheck!!
    );

    if (results.duplicate) {
      setIsDuplicateModalOpen(true);
    } else if (results.existingInstitution) {
      setPublicToken(public_token);
      setMetadata(metadata);
      setIsExistingInstitutionModalOpen(true);
    } else {
      window.location.reload();
    }
  };
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
    onExit: (error, metadata) => {
      if (error) {
        console.error('Link session encountered an error:', error);
      }
    },
    // onEvent: (eventName, metadata) => {},
    // onLoad: () => {},
  };
  const { open, ready } = usePlaidLink(config);
  if (!data) return <Skeleton active />;
  const { isActiveSubscription } = data;
  const platform = Capacitor.getPlatform();
  const handleExistingInstitution = async () => {
    if (publicToken && metadata) {
      setLoading(true);

      await exchangePublicToken(publicToken, metadata, true);
      setLoading(false);
      setIsExistingInstitutionModalOpen(false);
      window.location.reload();
    }
  };

  return (
    <>
      {isActiveSubscription ? (
        <Button
          data-id='plaid-link-button'
          type='primary'
          size={props.size ?? 'large'}
          onClick={() => open()}
          disabled={!ready}
        >
          {props.text ?? 'Link New Bank'}
        </Button>
      ) : (
        <Text>You must be subscribed to link a bank account.</Text>
      )}

      <Modal
        title='Duplicate Account Detected'
        open={isDuplicateModalOpen}
        onOk={() => setIsDuplicateModalOpen(false)}
        footer={
          <Button type='primary' onClick={() => setIsDuplicateModalOpen(false)}>
            OK
          </Button>
        }
        onCancel={() => setIsDuplicateModalOpen(false)}
      >
        <Paragraph>
          We detected a duplicate account. Please modify the existing accounts
          by managing them in your <Link to='/user'>user profile</Link>.
        </Paragraph>
      </Modal>
      <Modal
        title='Existing Institution Detected'
        open={isExistingInstitutionModalOpen}
        onOk={() => setIsExistingInstitutionModalOpen(false)}
        footer={
          <>
            <Button onClick={() => setIsExistingInstitutionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type='primary'
              loading={loading}
              onClick={handleExistingInstitution}
            >
              Confirm
            </Button>
          </>
        }
        onCancel={() => setIsExistingInstitutionModalOpen(false)}
      >
        <Paragraph>
          We detected an existing institution: {metadata?.institution?.name}
          already linked with your account. Is this a new sign in for this bank?
        </Paragraph>
      </Modal>
    </>
  );
};

LinkButton.displayName = 'Link';

export default LinkButton;

function exchangePublicToken(
  publicToken: string,
  metadata: PlaidLinkOnSuccessMetadata,
  overrideExistingCheck: boolean
) {
  return apiFetch('/api/plaid/exchangeToken', 'POST', {
    publicToken,
    metadata,
    overrideExistingCheck,
  });
}
