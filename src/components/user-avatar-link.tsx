import React from "react";
import { Tooltip } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Bech32Prefix, normalizeToBech32 } from "../helpers/nip-19";
import { useUserMetadata } from "../hooks/use-user-metadata";
import { UserAvatar, UserAvatarProps } from "./user-avatar";

export const UserAvatarLink = React.memo(
  ({ pubkey, ...props }: UserAvatarProps) => {
    const { metadata } = useUserMetadata(pubkey);

    let label = "Loading...";
    if (metadata?.display_name && metadata?.name) {
      label = `${metadata.display_name} (${metadata.name})`;
    } else if (metadata?.name) {
      label = metadata.name;
    } else {
      label = normalizeToBech32(pubkey) ?? pubkey;
    }

    return (
      <Tooltip label={label}>
        <Link to={`/user/${normalizeToBech32(pubkey, Bech32Prefix.Pubkey)}`}>
          <UserAvatar pubkey={pubkey} {...props} />
        </Link>
      </Tooltip>
    );
  }
);
