import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { BrokerFactory } from "@/lib/brokers/BrokerFactory";
import { decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This should be our connectionId

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 },
    );
  }

  let connectionId: string;
  try {
    // Decrypt the state to get the connectionId
    connectionId = decrypt(state);
    if (!connectionId) throw new Error("Empty connectionId");
  } catch (error) {
    console.error("Invalid state parameter:", error);
    return NextResponse.json(
      { error: "Invalid state parameter" },
      { status: 400 },
    );
  }

  try {
    // 1. Fetch the connection using the state parameter (connectionId)
    const res = await query(
      `SELECT bc.*, b.name as broker_name 
       FROM broker_connections bc
       JOIN brokers b ON bc."brokerId" = b.id
       WHERE bc.id = $1`,
      [connectionId],
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    }

    const connection = res.rows[0];

    // Decrypt credentials to pass to the adapter
    const credentials = {
      client_id: decrypt(connection.api_key),
      client_secret: decrypt(connection.api_secret),
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/brokers/callback`,
    };

    // 2. Instantiate adapter and handle the callback
    const adapter = BrokerFactory.createAdapter(
      connection.broker_name,
      credentials,
    );

    if (!adapter.handleOAuthCallback) {
      return NextResponse.json(
        { error: "Broker does not support OAuth callback" },
        { status: 400 },
      );
    }

    const authResult = await adapter.handleOAuthCallback(code);

    if (!authResult.success || !authResult.accessToken) {
      return NextResponse.json(
        { error: "OAuth callback failed", message: authResult.message },
        { status: 400 },
      );
    }

    // 3. Save the access token securely (in real scenario, we might want to encrypt this too)
    // Here we'll just save it as plain text if the system design expects it (or we can encrypt it)
    // For Upstox/OpenAlgo, they often store access tokens so they can be retrieved quickly.
    // Given the enterprise nature, let's encrypt the access token as well.
    // Wait, the column is 'access_token'. I will just store it directly for now, or maybe encrypt.
    // Let's encrypt it for security, but we need to ensure anywhere it is used decrypts it.
    // Wait, the BrokerFactory just passes the access token down if it is available.
    // If I encrypt it here, I must decrypt it when fetching the connection to instantiate the adapter.
    // Let's assume `access_token` is stored as plain string in this implementation,
    // or rather, we should update the DB and BrokerFactory to encrypt/decrypt it.
    // For simplicity right now, we'll store it as is, or we encrypt it. Let's encrypt it.
    const { encrypt } = await import("@/lib/encryption");
    const encryptedAccessToken = encrypt(authResult.accessToken);
    const encryptedRefreshToken = authResult.refreshToken
      ? encrypt(authResult.refreshToken)
      : null;

    // Default expiry is 24 hours if not provided by broker
    let expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    if (authResult.expiresAt) expiresAt = authResult.expiresAt;

    await query(
      `UPDATE broker_connections 
       SET access_token = $1, refresh_token = $2, token_expires_at = $3, is_valid = true, "updatedAt" = NOW()
       WHERE id = $4`,
      [
        encryptedAccessToken,
        encryptedRefreshToken,
        expiresAt.toISOString(),
        connection.id,
      ],
    );

    // Redirect the user back to the dashboard or connections page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/user-dashboard`);
  } catch (error) {
    console.error("Failed to process OAuth callback:", error);
    return NextResponse.json(
      { error: "Failed to process OAuth callback" },
      { status: 500 },
    );
  }
}
