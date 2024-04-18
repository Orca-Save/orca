import { formatCurrency } from "@/lib/formatters";
import {
  Button,
  Column,
  Img,
  Row,
  Section,
  Text,
} from "@react-email/components";

type TransferInformationProps = {
  saving: { id: string; createdAt: Date; pricePaidInCents: number };
  goal: { imagePath: string; name: string; description: string };
  downloadVerificationId: string;
};

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function TransferInformation({
  saving,
  goal,
  downloadVerificationId,
}: TransferInformationProps) {
  return (
    <>
      <Section>
        <Row>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Saving ID
            </Text>
            <Text className="mt-0 mr-4">{saving.id}</Text>
          </Column>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Purchased On
            </Text>
            <Text className="mt-0 mr-4">
              {dateFormatter.format(saving.createdAt)}
            </Text>
          </Column>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Price Paid
            </Text>
            <Text className="mt-0 mr-4">
              {formatCurrency(saving.pricePaidInCents / 100)}
            </Text>
          </Column>
        </Row>
      </Section>
      <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
        <Img
          width="100%"
          alt={goal.name}
          src={`${process.env.NEXT_PUBLIC_SERVER_URL}${goal.imagePath}`}
        />
        <Row className="mt-8">
          <Column className="align-bottom">
            <Text className="text-lg font-bold m-0 mr-4">{goal.name}</Text>
          </Column>
          <Column align="right">
            <Button
              href={`${process.env.NEXT_PUBLIC_SERVER_URL}/goals/download/${downloadVerificationId}`}
              className="bg-black text-white px-6 py-4 rounded text-lg"
            >
              Download
            </Button>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text className="text-gray-500 mb-0">{goal.description}</Text>
          </Column>
        </Row>
      </Section>
    </>
  );
}
