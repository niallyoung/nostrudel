import { Button, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { useReadRelayUrls } from "../../hooks/use-client-relays";
import useTimelineLoader from "../../hooks/use-timeline-loader";
import useSubject from "../../hooks/use-subject";
import RelayReviewNote from "./components/relay-review-note";
import { useTimelineCurserIntersectionCallback } from "../../hooks/use-timeline-cursor-intersection-callback";
import IntersectionObserverProvider from "../../providers/intersection-observer";
import PeopleListProvider, { usePeopleListContext } from "../../providers/people-list-provider";
import PeopleListSelection from "../../components/people-list-selection/people-list-selection";
import VerticalPageLayout from "../../components/vertical-page-layout";
import { ArrowLeftSIcon } from "../../components/icons";

function RelayReviewsPage() {
  const navigate = useNavigate();
  const readRelays = useReadRelayUrls();

  const { filter } = usePeopleListContext();
  const timeline = useTimelineLoader(
    "relay-reviews",
    readRelays,
    {
      ...filter,
      kinds: [1985],
      "#l": ["review/relay"],
    },
    { enabled: !!filter },
  );

  const reviews = useSubject(timeline.timeline);

  const callback = useTimelineCurserIntersectionCallback(timeline);

  return (
    <IntersectionObserverProvider<string> callback={callback}>
      <VerticalPageLayout>
        <Flex gap="2">
          <Button onClick={() => navigate(-1)} leftIcon={<ArrowLeftSIcon />}>
            Back
          </Button>
          <PeopleListSelection />
        </Flex>
        {reviews.map((event) => (
          <RelayReviewNote key={event.id} event={event} />
        ))}
      </VerticalPageLayout>
    </IntersectionObserverProvider>
  );
}

export default function RelayReviewsView() {
  return (
    <PeopleListProvider initList="global">
      <RelayReviewsPage />
    </PeopleListProvider>
  );
}
