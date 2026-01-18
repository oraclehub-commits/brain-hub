# LINE\u9023\u643a\u30b7\u30b9\u30c6\u30e0 - \u74b0\u5883\u5909\u6570\u8ffd\u52a0\u30ac\u30a4\u30c9

`.env.local` \u30d5\u30a1\u30a4\u30eb\u306b\u4ee5\u4e0b\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\uff1a

```env
# ============================================
# LINE Messaging API
# ============================================
# LINE Developers Console \u2192 Messaging API \u30c1\u30e3\u30cd\u30eb \u2192 Basic settings
LINE_CHANNEL_ID=your_channel_id_here
LINE_CHANNEL_SECRET=your_channel_secret_here

# LINE Developers Console \u2192 Messaging API settings \u2192 Channel access token
LINE_CHANNEL_ACCESS_TOKEN=your_long_lived_channel_access_token_here

# ============================================
# LINE LIFF (LINE Front-end Framework)
# ============================================
# LINE Developers Console \u2192 LINE\u30ed\u30b0\u30a4\u30f3 \u2192 LIFF \u2192 LIFF ID
NEXT_PUBLIC_LIFF_ID=liff-xxxxxxxxxx

# ============================================
# LINE Rich Menu IDs (\u4efb\u610f)
# ============================================
# LINE Developers Console\u3067\u30ea\u30c3\u30c1\u30e1\u30cb\u30e5\u30fc\u4f5c\u6210\u5f8c\u306bID\u3092\u8a2d\u5b9a
# \u7121\u6599\u7248\u30e6\u30fc\u30b6\u30fc\u7528
LINE_RICH_MENU_FREE=richmenu-xxxxxxxxxx

# PRO\u7248\u30e6\u30fc\u30b6\u30fc\u7528
LINE_RICH_MENU_PRO=richmenu-yyyyyyyyyy
```

## \u53d6\u5f97\u624b\u9806

### 1. Messaging API\u8a2d\u5b9a

1. [LINE Developers Console](https://developers.line.biz/console/) \u306b\u30a2\u30af\u30bb\u30b9
2. \u30d7\u30ed\u30d0\u30a4\u30c0\u30fc\u3092\u9078\u629e or \u4f5c\u6210
3. **Messaging API** \u30c1\u30e3\u30cd\u30eb\u3092\u4f5c\u6210
4. **Basic settings** \u30bf\u30d6:
   - `Channel ID` \u3092\u30b3\u30d4\u30fc \u2192 `LINE_CHANNEL_ID`
   - `Channel secret` \u3092\u30b3\u30d4\u30fc \u2192 `LINE_CHANNEL_SECRET`
5. **Messaging API settings** \u30bf\u30d6:
   - **Channel access token (long-lived)** \u3092 Issue
   - \u30c8\u30fc\u30af\u30f3\u3092\u30b3\u30d4\u30fc \u2192 `LINE_CHANNEL_ACCESS_TOKEN`

### 2. LIFF\u30a2\u30d7\u30ea\u8a2d\u5b9a

1. \u540c\u3058\u30c1\u30e3\u30cd\u30eb\u306e **LINE\u30ed\u30b0\u30a4\u30f3** \u30bf\u30d6\u3092\u958b\u304f
2. **LIFF** \u30bb\u30af\u30b7\u30e7\u30f3\u3067 **\u8ffd\u52a0** \u3092\u30af\u30ea\u30c3\u30af
3. \u8a2d\u5b9a\u5024:
   - **LIFF\u30a2\u30d7\u30ea\u540d**: `brain-hub` (\u4efb\u610f)
   - **\u30b5\u30a4\u30ba**: `Full`
   - **\u30a8\u30f3\u30c9\u30dd\u30a4\u30f3\u30c8URL**: 
     - \u672c\u756a: `https://your-domain.vercel.app/line/callback`
     - \u30ed\u30fc\u30ab\u30eb\u30c6\u30b9\u30c8: `http://localhost:3000/line/callback` (ngrok\u63a8\u5968)
   - **Scope**: `openid`, `profile` (\u4e21\u65b9\u9078\u629e)
   - **\u53cb\u3060\u3061\u8ffd\u52a0\u30aa\u30d7\u30b7\u30e7\u30f3**: `On (normal)`
4. \u4f5c\u6210\u5f8c\u3001**LIFF ID** (`liff-xxxxxxxxxx`) \u3092\u30b3\u30d4\u30fc \u2192 `NEXT_PUBLIC_LIFF_ID`

### 3. \u30ea\u30c3\u30c1\u30e1\u30cb\u30e5\u30fc\u4f5c\u6210 (\u30aa\u30d7\u30b7\u30e7\u30f3)

\u30ea\u30c3\u30c1\u30e1\u30cb\u30e5\u30fc\u3092\u8a2d\u5b9a\u3057\u305f\u3044\u5834\u5408\uff1a

1. **Messaging API settings** \u30bf\u30d6 \u2192 **Rich menus**
2. **Create** \u3067Free\u7528\u3068PRO\u7528\u30922\u3064\u4f5c\u6210
3. \u5404\u30ea\u30c3\u30c1\u30e1\u30cb\u30e5\u30fcID\u3092`.env.local`\u306b\u8a2d\u5b9a

## \u78ba\u8a8d\u624b\u9806

```bash
# .env.local\u304c\u6b63\u3057\u304f\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u308b\u304b\u78ba\u8a8d
grep \"LINE_\" .env.local

# \u30b5\u30fc\u30d0\u30fc\u3092\u518d\u8d77\u52d5 (\u74b0\u5883\u5909\u6570\u306e\u8aad\u307f\u8fbc\u307f)
npm run dev
```
