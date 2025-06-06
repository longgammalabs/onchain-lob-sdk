/**
 * Represents a cryptocurrency token.
 */
export interface Token {
  /**
   * Unique identifier for the token.
   */
  id: string;

  /**
   * Name of the token.
   */
  name: string;

  /**
   * Symbol of the token.
   */
  symbol: string;

  /**
   * Contract address of the token.
   */
  contractAddress: string;

  /**
   * Number of decimals the token uses.
   */
  decimals: number;

  /**
   * Number of rounding decimals for the token.
   */
  roundingDecimals: number;

  /**
   * Indicates whether the token is ERC20Permit compatible.
   */
  supportsPermit: boolean;

  /**
   * Image url for icon
   */
  iconUrl: string | null;

  /**
   * Indicates if token is native
   */
  isNative: boolean;

  /**
   * Token's pyth oracle address
   */
  pythAddress: string | null;

  /**
   * Token's price feed id
   */
  priceFeed: string | null;

  /**
   * Token's usd price
   */
  priceUsd: number | null;

  /**
   * Token's price feed decimals
   */
  priceFeedDecimals: number | null;

  /**
   * Token's priority when sorting
   */
  priority: number;

  /**
   * Token's source
   */
  source: string;

  /**
   * Description of the token
   */
  description: string;

  /**
   * Last time when token's price was updated
   */
  lastTouched: number | null;
}

export type TokenUpdate = Token;

export type TokenType = 'base' | 'quote';
