import { type FeaturesItemProps } from '../../Blocks/Features'
import InstantPayouts from '../../img/Features/instant-payouts.svg'
import LowFees from '../../img/Features/low-fees.svg'
import OnchainProvenance from '../../img/Features/onchain-provenance.svg'
import Permissionless from '../../img/Features/permissionless.svg'
import Privacy from '../../img/Features/privacy.svg'
import Royalties from '../../img/Features/royalties.svg'
import SecondaryMarket from '../../img/Features/secondary-market.svg'
import PerpetualStorage from '../../img/Features/storage.svg'
import TrueOwenership from '../../img/Features/true-ownership.svg'

export const FeaturesData: FeaturesItemProps[] = [
  {
    icon: TrueOwenership,
    name: 'True ownership',
  },
  {
    icon: Privacy,
    name: '100% privacy',
  },
  {
    icon: Permissionless,
    name: 'Fully permissionless',
  },
  {
    icon: OnchainProvenance,
    name: 'Onchain provenance',
  },
  {
    icon: SecondaryMarket,
    name: 'Secondary market',
  },
  {
    icon: Royalties,
    name: 'Royalties',
  },
  {
    icon: LowFees,
    name: 'Low fees',
  },
  {
    icon: InstantPayouts,
    name: 'Instant payouts',
  },
  {
    icon: PerpetualStorage,
    name: 'Perpetual dStorage',
    mobileName: 'Perpetual Decentralized Storage',
  },
]
