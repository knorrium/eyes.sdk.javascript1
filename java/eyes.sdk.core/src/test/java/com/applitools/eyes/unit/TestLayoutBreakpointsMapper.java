package com.applitools.eyes.unit;

import com.applitools.eyes.options.LayoutBreakpointsOptions;
import com.applitools.eyes.universal.dto.LayoutBreakpointsDto;
import com.applitools.eyes.universal.mapper.LayoutBreakpointsMapper;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;

public class TestLayoutBreakpointsMapper {

    @Test
    public void testEmptyLayoutBreakpointsOptionsMapping() {
        LayoutBreakpointsOptions options = new LayoutBreakpointsOptions();
        LayoutBreakpointsDto dto = LayoutBreakpointsMapper.toLayoutBreakpointsDto(options);

        Assert.assertNull(dto);
    }

    @Test
    public void testDefaultLayoutBreakpointsMapping() {
        LayoutBreakpointsOptions options = new LayoutBreakpointsOptions().breakpoints();
        LayoutBreakpointsDto dto = LayoutBreakpointsMapper.toLayoutBreakpointsDto(options);

        Assert.assertTrue((Boolean) dto.getBreakpoints());
        Assert.assertNull(dto.getReload());
    }

    @Test
    public void testExplicitLayoutBreakpointsMapping() {
        LayoutBreakpointsOptions options = new LayoutBreakpointsOptions().breakpoints(10, 20, 30);
        LayoutBreakpointsDto dto = LayoutBreakpointsMapper.toLayoutBreakpointsDto(options);

        Assert.assertEquals(dto.getBreakpoints(), new ArrayList<Integer>() {{ add(10); add(20); add(30);}});
        Assert.assertNull(dto.getReload());
    }

    @Test
    public void testLayoutBreakpointsReloadMapping() {
        LayoutBreakpointsOptions options = new LayoutBreakpointsOptions().breakpoints().reload();
        LayoutBreakpointsDto dto = LayoutBreakpointsMapper.toLayoutBreakpointsDto(options);

        Assert.assertTrue((Boolean) dto.getBreakpoints());
        Assert.assertTrue(dto.getReload());
    }

    @Test
    public void shouldSendNullWhenUsingReloadWithoutBreakpoints() {
        LayoutBreakpointsOptions options = new LayoutBreakpointsOptions().reload();
        LayoutBreakpointsDto dto = LayoutBreakpointsMapper.toLayoutBreakpointsDto(options);

        Assert.assertNull(dto);
    }
}
