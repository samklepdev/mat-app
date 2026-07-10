const { withEntitlementsPlist, withXcodeProject } = require('expo/config-plugins');

// This app only ever uses *local* notifications (scheduled reminders,
// milestones) — never remote push — but expo-notifications' own config
// plugin unconditionally adds the `aps-environment` entitlement anyway,
// since it can't tell local-only usage apart from future push usage. That
// entitlement requires a paid Apple Developer Program membership to
// provision; a free/personal team fails with "do not support the Push
// Notifications capability." Strip it so local device builds work with a
// free Apple ID.
//
// Separately, Xcode 15+ defaults new projects to sandboxing build-phase
// scripts, which the Expo dev-client bundling script isn't compatible with
// yet (fails writing ip.txt). Disable it for both build configurations.
//
// Both of these previously had to be hand-patched directly in ios/ after
// every `expo prebuild`, which doesn't survive a clean regeneration. This
// plugin makes both fixes permanent and automatic.
module.exports = function withDevFriendlyIOS(config) {
  config = withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });

  config = withXcodeProject(config, (config) => {
    const configurations = config.modResults.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const entry = configurations[key];
      if (entry.buildSettings) {
        entry.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
      }
    }
    return config;
  });

  return config;
};
