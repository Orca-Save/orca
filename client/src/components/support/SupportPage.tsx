import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Collapse,
  Input,
  message,
  Space,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { apiFetch } from '../../utils/general';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    if (!email || !query) {
      message.error('Please provide both email and your query.');
      return;
    }
    setLoading(true);
    const response = await apiFetch('/api/support/submitTicket', 'POST', {
      email,
      query,
    });

    if (response?.success) {
      message.success('Your query has been submitted successfully!');
      setEmail('');
      setQuery('');
    } else {
      message.error('Failed to submit your query. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className='bg-color-black mg-5 flex justify-center items-center min-h-screen'>
      <Space direction='vertical' size={40} className='w-full max-w-4xl p-4'>
        <Title level={2} className='text-center text-white'>
          Orca Support Center
        </Title>
        <Paragraph className='text-center text-2xl text-gray-400'>
          We're here to help you with any questions or issues you may have.
          Browse our FAQs or contact us directly.
        </Paragraph>
        <Collapse
          accordion
          bordered={false}
          className='bg-color-dark rounded-lg'
          expandIconPosition='right'
        >
          <Panel header='How do I sign up?' key='1'>
            <Text>
              To sign up, click on the "Let’s do this" button on the home page
              and follow the instructions. If you're using our mobile app,
              ensure that you've installed the latest version.
            </Text>
          </Panel>
          <Panel header='How does impulse saving work?' key='2'>
            <Text>
              Impulse saving allows you to set aside money you would have spent
              impulsively. Simply tap the “Save it” button when you’re about to
              make an unnecessary purchase, and that amount will be transferred
              to your savings.
            </Text>
          </Panel>
          <Panel header='How do I contact support?' key='3'>
            <Text>
              You can contact us via email at{' '}
              <a href='mailto:launch@orca-money.com'>launch@orca-money.com</a>{' '}
              or by phone at +1 (737) 237-9282. Our support team is available
              Monday to Friday from 9 AM to 5 PM EST.
            </Text>
          </Panel>
        </Collapse>

        <Card className='bg-color-dark p-4' bordered={false}>
          <Title level={4} className='text-white'>
            Submit a Query
          </Title>
          <Text className='text-gray-400'>
            If you have a specific question or issue, please let us know and
            we’ll get back to you as soon as possible.
          </Text>
          <Space direction='vertical' size='large' className='w-full mt-4'>
            <Input
              prefix={<MailOutlined />}
              placeholder='Your email address'
              value={email}
              onChange={handleEmailChange}
            />
            <TextArea
              rows={4}
              placeholder='Describe your issue or question'
              value={query}
              onChange={handleQueryChange}
            />
            <Button
              type='primary'
              size='large'
              loading={loading}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Space>
        </Card>

        <Space direction='vertical' size='small' className='text-center'>
          <Text className='text-gray-400'>
            <MailOutlined /> Email:{' '}
            <a href='mailto:launch@orca-money.com'>launch@orca-money.com</a>
          </Text>
          <Text className='text-gray-400'>
            <PhoneOutlined /> Phone: +1 (737) 237-9282
          </Text>
        </Space>
      </Space>
    </div>
  );
}
