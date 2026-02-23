# Set iOS Simulator location to E10 5BT (Leyton, London)

## Option 1: Custom Location (quick)

1. Run your app in the **iOS Simulator**.
2. In the simulator menu bar: **Features → Location → Custom Location…**
3. Enter:
   - **Latitude:** `51.558`
   - **Longitude:** `-0.011`
4. Click **OK**.

The simulator will now report this location (Leyton E10 area, near E10 5BT).

---

## Option 2: GPX file (reusable)

1. In the simulator menu: **Features → Location → Custom Location…**
2. Leave the dialog open, or use **Features → Location** and see if your simulator supports loading a GPX file (Xcode: **Debug → Simulate Location** can load a GPX from your project).
3. Or in **Xcode**: run the app, then **Debug → Simulate Location → Add GPX File…** and choose `simulator-location-E10-5BT.gpx` from this project folder.

---

## Option 3: Terminal (when simulator is booted)

```bash
# List booted device
xcrun simctl list devices | grep Booted

# Set location (lat,lon as a single argument)
xcrun simctl location booted set 51.558,-0.011
```

Or for the currently booted simulator:

```bash
xcrun simctl location booted set 51.558,-0.011
```

---

**Coordinates used:** 51.558, -0.011 (Leyton E10, London — representative of E10 5BT area)
