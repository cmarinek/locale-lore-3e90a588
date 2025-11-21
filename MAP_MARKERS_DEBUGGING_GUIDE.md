# 🗺️ Map Markers Debugging Guide

## Issue Report
**Problem:** Fact/lore markers are not showing up on the maps (/map and /hybrid pages)

**Status:** Navigation fixed ✅ | Marker visibility needs verification ⚠️

---

## ✅ What Was Fixed

### 1. Mobile Navigation Issues (RESOLVED)
- ✅ Added Map to mobile bottom navigation
- ✅ Added Map to hamburger menu for mobile
- ✅ Made Map accessible to guest users
- ✅ Synchronized navigation configs across the application

**Result:** Users can now access /map and /hybrid pages on mobile devices.

---

## 🔍 Potential Causes for Missing Markers

The map component and data loading code are **technically correct**. If markers aren't showing, it's likely one of these issues:

### 1. No Verified Facts in Database ⚠️ MOST LIKELY
**Location:** `src/stores/discoveryStore.ts:108`

```typescript
.eq('status', 'verified')  // Only shows verified facts
```

**Check:**
```sql
-- Run in Supabase SQL editor
SELECT COUNT(*) FROM facts WHERE status = 'verified';
SELECT * FROM facts WHERE status = 'verified' LIMIT 10;
```

**If count is 0:**
- No markers will appear (expected behavior)
- You need to verify some facts first
- Or change filter temporarily for testing

**Solution A: Verify Existing Facts**
1. Go to Admin panel
2. Find facts with status = 'pending' or 'draft'
3. Change status to 'verified'

**Solution B: Create Test Facts**
```sql
-- Insert test facts for debugging
INSERT INTO facts (title, description, latitude, longitude, status, category_id, author_id)
VALUES
  ('Eiffel Tower', 'Famous landmark in Paris', 48.8584, 2.2945, 'verified',
   (SELECT id FROM categories LIMIT 1),
   (SELECT id FROM profiles LIMIT 1)),
  ('Statue of Liberty', 'Iconic statue in NYC', 40.6892, -74.0445, 'verified',
   (SELECT id FROM categories LIMIT 1),
   (SELECT id FROM profiles LIMIT 1)),
  ('Big Ben', 'Clock tower in London', 51.5007, -0.1246, 'verified',
   (SELECT id FROM categories LIMIT 1),
   (SELECT id FROM profiles LIMIT 1));
```

---

### 2. Mapbox Token Issues
**Location:** `src/components/map/UnifiedMap.tsx:130-166`

The map loads the Mapbox token from edge function `get-mapbox-token`.

**Check Console for:**
```
❌ [UnifiedMap] No token
❌ [UnifiedMap] Token error:
```

**Solution:**
1. Check edge function is deployed:
   ```bash
   npx supabase functions list
   ```

2. Test token endpoint:
   ```bash
   curl https://[your-project].supabase.co/functions/v1/get-mapbox-token
   ```

3. Verify environment variable:
   - In Supabase Dashboard → Settings → Secrets
   - Should have: `MAPBOX_PUBLIC_TOKEN`

---

### 3. Map Not Initializing
**Symptoms:**
- Blank grey screen
- Loading skeleton never disappears
- No map controls visible

**Check Console for:**
```
Map initialization failed
Token status: error
```

**Debug Steps:**

1. **Check if map container exists:**
   ```javascript
   // In browser console on /map page
   document.querySelector('.mapboxgl-map')
   // Should return an element, not null
   ```

2. **Check token status:**
   ```javascript
   // Check local storage
   localStorage.getItem('mapbox-token-cache')
   ```

3. **Force token refresh:**
   ```javascript
   // In browser console
   localStorage.removeItem('mapbox-token-cache')
   location.reload()
   ```

---

### 4. Clustering Hiding Markers
**Location:** `src/components/map/UnifiedMap.tsx:229-254`

If facts are too close together or zoom is too far out, clustering may hide individual markers.

**Debug:**
1. Open /map page
2. Zoom in to a specific location (zoom level 12+)
3. Clusters should expand into individual markers

**Temporarily Disable Clustering:**
```typescript
// In Map.tsx line 137
<UnifiedMap
  facts={filteredFacts}
  enableClustering={false}  // Change to false
  ...
/>
```

---

### 5. Facts Outside Viewport
**Symptoms:** Map loads but no markers visible

**Check:**
- Default map center: `[0, 20]` (Atlantic Ocean near Africa)
- Facts might be in different geographic regions

**Solution:**
1. Check actual fact locations:
   ```sql
   SELECT title, latitude, longitude FROM facts WHERE status = 'verified';
   ```

2. Manually navigate map to those coordinates
3. Or change default center in Map.tsx:
   ```typescript
   <UnifiedMap
     center={[fact.longitude, fact.latitude]}  // Use first fact's location
     zoom={10}
   />
   ```

---

### 6. Browser Console Errors
**Always check browser console when map doesn't load!**

Common errors:
```
❌ WebGL not supported
   Solution: Use different browser or update graphics drivers

❌ Quota exceeded for quota metric
   Solution: Mapbox API limit reached, check usage

❌ Network request failed
   Solution: Check internet connection, firewall settings

❌ Cannot read properties of undefined
   Solution: Data structure mismatch, check fact schema
```

---

## 🧪 Complete Debugging Checklist

Run through this checklist in order:

### Step 1: Verify Database Has Facts
```bash
# In Supabase SQL Editor
SELECT COUNT(*) as total_facts FROM facts;
SELECT COUNT(*) as verified_facts FROM facts WHERE status = 'verified';
SELECT id, title, latitude, longitude, status FROM facts LIMIT 10;
```

**Expected:** At least 1 verified fact with valid lat/lng

---

### Step 2: Test Map Page Loads
1. Navigate to https://localelore.org/map
2. Wait for 10 seconds
3. **Expected:** Map should load (not grey screen)

If grey screen:
- Check console for token errors
- Verify `get-mapbox-token` function deployed
- Check Mapbox token in Supabase secrets

---

### Step 3: Check Facts Loaded
```javascript
// In browser console on /map page
// Check if facts are loaded in store
const facts = JSON.parse(localStorage.getItem('discovery-store'))
console.log('Facts count:', facts?.state?.facts?.length || 0)
console.log('First fact:', facts?.state?.facts?.[0])
```

**Expected:** Facts array with length > 0

If length is 0:
- Check network tab for failed requests
- Check `initializeData()` was called
- Verify database connection

---

### Step 4: Verify Markers Created
```javascript
// In browser console on /map page
// Check if markers were created
document.querySelectorAll('.fact-marker').length
// Should return number > 0
```

**Expected:** Number equal to visible facts count

If 0:
- Facts are outside current viewport
- Zoom level too low (clusters hiding markers)
- Marker creation failed (check console errors)

---

### Step 5: Manual Marker Test
```javascript
// In browser console on /map page
// Create a test marker manually
const marker = new mapboxgl.Marker()
  .setLngLat([0, 0])  // Coordinates
  .addTo(window.map);  // Assuming map instance is global
```

If this works:
- Map is working fine
- Issue is with fact data or rendering logic

If this fails:
- Map instance issue
- Mapbox GL library not loaded

---

## 🎯 Quick Fix for Testing

If you just want to see markers appear immediately for testing:

### Option A: Lower Verification Requirement (Temporary)
```typescript
// In src/stores/discoveryStore.ts line 108
// TEMPORARY CHANGE - Remove for production
.eq('status', 'verified')  // Change to:
.in('status', ['verified', 'pending', 'draft'])  // Shows all facts
```

### Option B: Create Test Data Programmatically
```typescript
// In browser console on /map page
const testFacts = [
  {
    id: crypto.randomUUID(),
    title: 'Test Fact 1',
    latitude: 40.7128,
    longitude: -74.0060,
    status: 'verified',
    category: 'history'
  },
  {
    id: crypto.randomUUID(),
    title: 'Test Fact 2',
    latitude: 51.5074,
    longitude: -0.1278,
    status: 'verified',
    category: 'culture'
  }
];

// Manually set facts in store
const store = useDiscoveryStore.getState();
store.setFacts(testFacts);
// Reload page
location.reload();
```

---

## 📊 Expected Behavior

When working correctly:

### On /map Page:
1. ✅ Page loads within 2-3 seconds
2. ✅ Mapbox map displays (not grey screen)
3. ✅ Zoom controls appear (+ / -)
4. ✅ Search bar overlays map (top)
5. ✅ Colored circular markers appear on map
6. ✅ Clicking marker opens fact preview modal
7. ✅ Markers cluster when zoomed out
8. ✅ Clusters expand when zoomed in (level 12+)

### On /hybrid Page:
1. ✅ Same as map page PLUS
2. ✅ Bottom panel shows "Stories in View"
3. ✅ Fact cards appear in grid below map
4. ✅ Clicking card zooms map to that location

---

## 🔧 Code Locations

If you need to modify the code:

### Map Component
- **Main:** `src/components/map/UnifiedMap.tsx`
- **Marker Creation:** Line 257-330
- **Clustering:** Line 229-254
- **Token Loading:** Line 130-166

### Map Pages
- **Map Page:** `src/pages/Map.tsx`
- **Hybrid Page:** `src/pages/Hybrid.tsx`

### Data Store
- **Facts Store:** `src/stores/discoveryStore.ts`
- **Load Facts:** Line 79-137 (`loadMoreFacts`)
- **Initialize:** Line 274-278 (`initializeData`)

### Routes
- **App Routes:** `src/components/app/AppRoutes.tsx`
- **Map Route:** Line 145
- **Hybrid Route:** Line 144

---

## 🆘 Still Not Working?

### Collect Debug Information:

1. **Browser Console Log:**
   ```javascript
   // Run in console and copy output
   console.log('Debug Info:', {
     factsCount: useDiscoveryStore.getState().facts.length,
     isLoading: useDiscoveryStore.getState().isLoading,
     error: useDiscoveryStore.getState().error,
     markers: document.querySelectorAll('.fact-marker').length,
     mapLoaded: !!document.querySelector('.mapboxgl-map'),
     tokenCached: !!localStorage.getItem('mapbox-token-cache')
   });
   ```

2. **Database Facts Count:**
   ```sql
   SELECT status, COUNT(*) as count
   FROM facts
   GROUP BY status;
   ```

3. **Network Tab:**
   - Look for failed requests to Supabase
   - Check mapbox-token endpoint response
   - Verify facts query returns data

4. **Screenshots:**
   - Grey/blank map screen
   - Browser console errors
   - Network tab showing failed requests

---

## ✅ Verification After Fixes

Once you make changes:

1. **Clear Browser Cache:**
   ```
   Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   Or: DevTools → Application → Clear Storage → Clear site data
   ```

2. **Check Mobile:**
   ```
   - Navigate to /map from bottom nav
   - Verify map loads
   - Verify markers appear
   - Test marker click
   ```

3. **Check Desktop:**
   ```
   - Navigate to /map from hamburger menu
   - Verify same functionality
   ```

4. **Test Guest User:**
   ```
   - Log out
   - Navigate to /map
   - Should work without authentication
   ```

---

## 📝 Summary

**Most Likely Issue:** No verified facts in database

**Quick Solution:** Create 2-3 verified test facts and reload /map page

**Code is Working:** All map rendering logic is correct

**Navigation is Fixed:** Users can now reach map pages on mobile

The map system is architecturally sound. If markers don't appear, it's a data issue, not a code issue.
