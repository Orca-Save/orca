import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components";
import { TransferInformation } from "./components/TransferInformation";
import React from "react";

type TransferHistoryEmailProps = {
  savings: {
    id: string;
    pricePaidInCents: number;
    createdAt: Date;
    goal: {
      name: string;
      imagePath: string;
      description: string;
    };
  }[];
};

TransferHistoryEmail.PreviewProps = {
  savings: [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 10000,
      goal: {
        name: "Goal name",
        description: "Some description",
        imagePath:
          "/goals/5aba7442-e4a5-4d2e-bfa7-5bd358cdad64-02 - What Is Next.js.jpg",
      },
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 2000,
      goal: {
        name: "Goal name 2",
        description: "Some other desc",
        imagePath:
          "/goals/db3035a5-e762-41b0-996f-d54ec730bc9c-01 - Course Introduction.jpg",
      },
    },
  ],
} satisfies TransferHistoryEmailProps;

export default function TransferHistoryEmail({
  savings,
}: TransferHistoryEmailProps) {
  return (
    <Html>
      <Preview>Saving History & Downloads</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Saving History</Heading>
            {savings.map((saving, index) => (
              <React.Fragment key={saving.id}>
                {/* <TransferInformation saving={saving} goal={saving.goal} /> */}
                {index < savings.length - 1 && <Hr />}
              </React.Fragment>
            ))}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
