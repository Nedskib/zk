/* PageELContext.java

{{IS_NOTE
	$Id: PageELContext.java,v 1.4 2006/03/09 08:24:47 tomyeh Exp $
	Purpose:
		
	Description:
		
	History:
		Thu Sep 15 21:56:45     2005, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
*/
package com.potix.web.el;

import java.io.Writer;

import javax.servlet.ServletContext;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.jsp.PageContext;
import javax.servlet.jsp.el.VariableResolver;
import javax.servlet.jsp.el.ExpressionEvaluator;

/**
 * An {@link ELContext} on top of {@link ELContext}.
 *
 * @author <a href="mailto:tomyeh@potix.com">tomyeh@potix.com</a>
 * @version $Revision: 1.4 $ $Date: 2006/03/09 08:24:47 $
 */
public class PageELContext implements ELContext {
	private final PageContext _pc;

	public PageELContext(PageContext pc) {
		_pc = pc;
	}
	public Writer getOut() {
		return _pc.getOut();
	}
	public ServletRequest getRequest() {
		return _pc.getRequest();
	}
	public ServletResponse getResponse() {
		return _pc.getResponse();
	}
	public ServletContext getServletContext() {
		return _pc.getServletContext();
	}
	public ExpressionEvaluator getExpressionEvaluator() {
		return _pc.getExpressionEvaluator();
	}
	public VariableResolver getVariableResolver() {
		return _pc.getVariableResolver();
	}
}
