import { IBrokerAdapter, BrokerCredentials } from './types';
import { ZerodhaAdapter } from './adapters/ZerodhaAdapter';
import { UpstoxAdapter } from './adapters/UpstoxAdapter';
import { AngelOneAdapter } from './adapters/AngelOneAdapter';
import { FyersAdapter } from './adapters/FyersAdapter';
import { DhanAdapter } from './adapters/DhanAdapter';
import { AliceBlueAdapter } from './adapters/AliceBlueAdapter';
import { KotakNeoAdapter } from './adapters/KotakNeoAdapter';
import { ShoonyaAdapter } from './adapters/ShoonyaAdapter';
import { PaytmMoneyAdapter } from './adapters/PaytmMoneyAdapter';
import { FivePaisaAdapter } from './adapters/FivePaisaAdapter';
import { GrowwAdapter } from './adapters/GrowwAdapter';
import { IIFLAdapter } from './adapters/IIFLAdapter';
import { SamcoAdapter } from './adapters/SamcoAdapter';
import { MotilalAdapter } from './adapters/MotilalAdapter';
import { MStockAdapter } from './adapters/MStockAdapter';
import { PocketfulAdapter } from './adapters/PocketfulAdapter';
import { TradejiniAdapter } from './adapters/TradejiniAdapter';
import { WisdomAdapter } from './adapters/WisdomAdapter';
import { ZebuAdapter } from './adapters/ZebuAdapter';
import { FlattradeAdapter } from './adapters/FlattradeAdapter';
import { FirstockAdapter } from './adapters/FirstockAdapter';
import { DeltaAdapter } from './adapters/DeltaAdapter';
import { IBullsAdapter } from './adapters/IBullsAdapter';
import { RMoneyAdapter } from './adapters/RMoneyAdapter';
import { DefinedgeAdapter } from './adapters/DefinedgeAdapter';
import { JainamXtsAdapter } from './adapters/JainamXtsAdapter';
import { CompositeAdapter } from './adapters/CompositeAdapter';
import { IndmoneyAdapter } from './adapters/IndmoneyAdapter';
import { NubraAdapter } from './adapters/NubraAdapter';
import { FivePaisaXtsAdapter } from './adapters/FivePaisaXtsAdapter';
import { IIFLCapitalAdapter } from './adapters/IIFLCapitalAdapter';
import { DhanSandboxAdapter } from './adapters/DhanSandboxAdapter';

export class BrokerFactory {
  /**
   * Instantiates the correct broker adapter based on the broker name.
   *
   * @param brokerName The unique name of the broker (e.g., 'zerodha', 'upstox')
   * @param encryptedCredentials Permanent encrypted credentials (API Key, Secret, etc.)
   * @param sessionData Transient session data (Access tokens, expiry, etc.)
   */
  static createAdapter(
    brokerName: string,
    encryptedCredentials: BrokerCredentials = {},
    sessionData: BrokerCredentials = {}
  ): IBrokerAdapter {
    const config = {
      ...encryptedCredentials,
      ...sessionData,
    } as Record<string, unknown>;

    const accessToken = (sessionData.access_token ||
      sessionData.accessToken) as string | undefined;

    switch (brokerName.toLowerCase()) {
      case 'zerodha':
        return new ZerodhaAdapter(config, accessToken);
      case 'upstox':
        return new UpstoxAdapter(config, accessToken);
      case 'angelone':
        return new AngelOneAdapter(config);
      case 'fyers':
        return new FyersAdapter(config);
      case 'dhan':
        return new DhanAdapter(config);
      case 'dhan_sandbox':
        return new DhanSandboxAdapter(config);
      case 'aliceblue':
        return new AliceBlueAdapter(config);
      case 'kotakneo':
        return new KotakNeoAdapter(config);
      case 'shoonya':
        return new ShoonyaAdapter(config);
      case 'paytm':
        return new PaytmMoneyAdapter(config);
      case 'fivepaisa':
        return new FivePaisaAdapter(config);
      case 'groww':
        return new GrowwAdapter(config);
      case 'iifl':
        return new IIFLAdapter(config);
      case 'samco':
        return new SamcoAdapter(config);
      case 'motilal':
        return new MotilalAdapter(config);
      case 'mstock':
        return new MStockAdapter(config);
      case 'pocketful':
        return new PocketfulAdapter(config);
      case 'tradejini':
        return new TradejiniAdapter(config);
      case 'wisdom':
        return new WisdomAdapter(config);
      case 'zebu':
        return new ZebuAdapter(config);
      case 'flattrade':
        return new FlattradeAdapter(config);
      case 'firstock':
        return new FirstockAdapter(config);
      case 'deltaexchange':
        return new DeltaAdapter(config);
      case 'ibulls':
        return new IBullsAdapter(config);
      case 'rmoney':
        return new RMoneyAdapter(config);
      case 'definedge':
        return new DefinedgeAdapter(config);
      case 'jainamxts':
        return new JainamXtsAdapter(config);
      case 'compositedge':
        return new CompositeAdapter(config);
      case 'indmoney':
        return new IndmoneyAdapter(config);
      case 'nubra':
        return new NubraAdapter(config);
      case 'fivepaisaxts':
        return new FivePaisaXtsAdapter(config);
      case 'iiflcapital':
        return new IIFLCapitalAdapter(config);
      default:
        throw new Error(
          `Broker adapter for '${brokerName}' is not implemented.`
        );
    }
  }
}
