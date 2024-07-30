import { Button, Modal, Typography } from 'antd';
import React, { useState } from 'react';
import { PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link';
import { Link } from 'react-router-dom';

const { Paragraph } = Typography;

interface LinkProps {
  linkToken: string | null;
  size?: 'small' | 'large' | 'middle';
  text?: string;
  overrideExistingAccountCheck?: boolean;
}

const LinkButton = (props: LinkProps) => {
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isExistingInstitutionModalOpen, setIsExistingInstitutionModalOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PlaidLinkOnSuccessMetadata | null>(
    null
  );

  const handleExistingInstitution = async () => {
    if (publicToken && metadata) {
      setLoading(true);

      await exchangePublicToken(publicToken, metadata, true);
      setLoading(false);
      setIsExistingInstitutionModalOpen(false);
    }
  };

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
    }
  };
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <>
      <Button
        data-id='plaid-link-button'
        type='primary'
        size={props.size ?? 'large'}
        onClick={() => open()}
        disabled={!ready}
      >
        {props.text ?? 'Link New Bank'}
      </Button>
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
  const token = localStorage.getItem('accessToken');
  console.log(process.env.REACT_APP_API_URL);
  return fetch(process.env.REACT_APP_API_URL + '/api/plaid/exchangeToken', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicToken,
      metadata,
      overrideExistingCheck,
    }),
  }).then((res) => res.json());
}
