import React, { useEffect, useMemo, useState } from "react";
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
// utils
import { fShortenNumber } from '../../utils/formatNumber'; 
import Iconify from '../Iconify';

import { SuperfluidWeb3Context } from "../../context/SuperfluidContext";
import { BigNumberish, ethers } from "ethers";
import { Box } from "@mui/material";
import _ from "lodash"; 

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(5, 2),
  color: theme.palette.info.main 
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: theme.palette.info.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0)} 0%, ${alpha(
    theme.palette.info.dark,
    0.24
  )} 100%)`
}));

// ----------------------------------------------------------------------

const TOTAL = 1352831;
const ANIMATION_MINIMUM_STEP_TIME = 80;

export default function IncommingStream() {
  const supweb3Context = React.useContext(SuperfluidWeb3Context);
  const { listOutFlows, totalStreams, flow } = supweb3Context;
  const [weiValue, setWeiValue] = useState(flow?.streamedUntilUpdatedAt);

  const balanceTimestampMs = useMemo(
    () => flow && ethers.BigNumber.from(flow?.updatedAtTimestamp).mul(1000),
    [flow]
  );

  useEffect(() => {
    if (flow !== undefined) {
      const flowRateBigNumber =
        flow && ethers.BigNumber.from(flow?.currentFlowRate);
      if (flowRateBigNumber && flowRateBigNumber.isZero()) {
        return; // No need to show animation when flow rate is zero.
      }

      const balanceBigNumber = ethers.BigNumber.from(
        flow && flow?.streamedUntilUpdatedAt
      );

      let stopAnimation = false;
      let lastAnimationTimestamp = 0;

      const animationStep = (currentAnimationTimestamp) => {
        if (stopAnimation) {
          return;
        }

        if (
          currentAnimationTimestamp - lastAnimationTimestamp >
          ANIMATION_MINIMUM_STEP_TIME
        ) {
          const currentTimestampBigNumber = ethers.BigNumber.from(
            new Date().valueOf() // Milliseconds elapsed since UTC epoch, disregards timezone.
          );

          setWeiValue(
            balanceBigNumber.add(
              currentTimestampBigNumber
                .sub(balanceTimestampMs)
                .mul(flowRateBigNumber)
                .div(1000)
            )
          );

          lastAnimationTimestamp = currentAnimationTimestamp;
        }

        window.requestAnimationFrame(animationStep);
      };

      window.requestAnimationFrame(animationStep);

      return () => {
        stopAnimation = true;
      };
    }
  }, [flow]);

  useEffect(() => {
    listOutFlows();
  }); 

  return (
    <RootStyle>
      <IconWrapperStyle>
        <Iconify icon="icon-park-outline:income-one" width={24} height={24} />
      </IconWrapperStyle>
      <Typography variant="h3"  color="#000"> {weiValue ? ethers.utils.formatEther(weiValue).slice(0,10) : "No Active stream"}</Typography>
      <Typography variant="subtitle2" color="#000" sx={{ opacity: 0.72 }}>
       Incomming Streams
      </Typography>
    </RootStyle>
  );
}
