import { type BenefitItemProps } from '../../Blocks/Benefits'
import InstantPayouts from '../../img/Benefits/instant-payouts.svg'
import LowFees from '../../img/Benefits/low-fees.svg'
import OnchainProvenance from '../../img/Benefits/onchain-provenance.svg'
import Permissionless from '../../img/Benefits/permissionless.svg'
import Privacy from '../../img/Benefits/privacy.svg'
import Royalties from '../../img/Benefits/royalties.svg'
import SecondaryMarket from '../../img/Benefits/secondary-market.svg'
import PerpetualStorage from '../../img/Benefits/storage.svg'
import TrueOwenership from '../../img/Benefits/true-ownership.svg'

export const BenefitsData: BenefitItemProps[] = [
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
