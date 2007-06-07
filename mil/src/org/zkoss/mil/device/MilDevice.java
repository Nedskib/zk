/* MilDevice.java

{{IS_NOTE
	Purpose:
		
	Description:
		
	History:
		Mon May 14 19:26:50     2007, Created by tomyeh
}}IS_NOTE

Copyright (C) 2007 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
*/
package org.zkoss.mil.device;

import org.zkoss.zk.ui.Desktop;
import org.zkoss.zk.device.Device;

/**
 * Represents the device supporting MIL (Mobile Interactive Language).
 *
 * @author tomyeh
 * @since 2.4.0
 */
public class MilDevice implements Device, java.io.Serializable {
	private String _type;
	private String _uamsg;

	//Device//
	public String getType() {
		return _type;
	}
	public String getUnavailableMessage() {
		return _uamsg;
	}
	public void setUnavailableMessage(String unavailmsg) {
		_uamsg = unavailmsg;
	}

	public void init(String type, Desktop desktop, String unavailmsg) {
		if (type == null || type.length() == 0)
			throw new IllegalArgumentException("type");
		_type = type;
		_uamsg = unavailmsg;
	}
	public void sessionWillPassivate(Desktop desktop) {
	}
	public void sessionDidActivate(Desktop desktop) {
	}
}
