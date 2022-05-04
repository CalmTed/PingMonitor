const actionTypes = {
        SET_PROPERTY_FOR_TESTING:"setPropertyForTesting",
        ADD_NEW_MONITOR:"addMonitor",
        REMOVE_MONITOR_BY_ID:"removeMonitorById",
        MONITOR_EXPORT_CONFIG:"monitorExportConfig",
        MONITOR_IMPORT_CONFIG:"monitorImportConfig",

        ADD_NEW_WINDOW_BY_SUBKEY:'addNewWindowBySubKey',
        REMOVE_WINDOW_BY_ID:'removeWindowById',
        WIN_SET_PROP:'winSetProp',
        WIN_TOGGLE_PROP:'winToggleProp',
        WIN_SET_IMAGE_PICKER_OPEN:'winSetImagePickerOpen',

        ADD_ROW:"addRow",
        REMOVE_ROW:"removeRow",
        ROW_SUBMIT_PING_PROBE:"rowSubmitPingProbe",
        ROW_SET_PROP:'rowSetProp',
        ROW_TOGGLE_PROP:'rowToggleProp',
        ROW_PAUSE_ALL:'rowPauseAllActive',
        ROW_UNALARM_ALL:'winUnalarmAllRows',
        ROW_UNSELECT_ALL:'rowUnselectAllSelected',
        ROW_EDIT_PROP_SET:'rowEditProperySet',
        ROW_EDIT_PROP_REMOVE:'rowEditProperyRemove',

}
module.exports = actionTypes;